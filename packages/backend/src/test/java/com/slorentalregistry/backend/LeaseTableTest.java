package com.slorentalregistry.backend;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Array;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Savepoint;
import org.junit.jupiter.api.Test;

/**
 * Tests the Lease table and its foreign key relationships.
 */
class LeaseTableTest {

  @Test
  void shouldCreateReadUpdateAndDeleteLeaseWithForeignKeys() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();
    int landlordId = DatabaseTestUtils.randomTestId();
    int propertyId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Verify the Lease table and columns exist.
         */
        DatabaseTestUtils.assertTableExists(conn, "lease");
        DatabaseTestUtils.assertPrimaryKeyExists(conn, "lease");
        DatabaseTestUtils.assertColumnExists(conn, "lease", "lease_id");
        DatabaseTestUtils.assertColumnExists(conn, "lease", "year");
        DatabaseTestUtils.assertColumnExists(conn, "lease", "property");
        DatabaseTestUtils.assertColumnExists(conn, "lease", "landlord");
        DatabaseTestUtils.assertColumnExists(conn, "lease", "tenants");

        /*
         * Verify the expected foreign keys exist.
         */
        DatabaseTestUtils.assertForeignKeyExists(
            conn, "lease", "property", "properties", "property_id");
        DatabaseTestUtils.assertForeignKeyExists(
            conn, "lease", "landlord", "landlords", "landlord_id");

        /*
         * Insert parent rows first.
         *
         * Accounts must exist before Landlords.
         * Landlords and Properties must exist before Lease.
         * Tenant is inserted because Lease.tenants stores tenant IDs.
         */
        insertAccount(conn, accountId);
        insertLandlord(conn, landlordId, accountId);
        insertProperty(conn, propertyId);
        insertTenant(conn, tenantId);

        /*
         * Now that all referenced rows exist, the Lease insert should succeed.
         */
        insertLease(conn, leaseId, propertyId, landlordId, tenantId);

        /*
         * Read back the lease and verify it references the correct rows.
         */
        String selectSql =
            """
            SELECT year, property, landlord, tenants
            FROM public.lease
            WHERE lease_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, leaseId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals(Date.valueOf("2026-01-01"), rs.getDate("year"));
            assertEquals(propertyId, rs.getInt("property"));
            assertEquals(landlordId, rs.getInt("landlord"));

            /*
             * Lease.tenants is an int array.
             * This verifies the tenant ID was stored in the array.
             */
            Integer[] tenants = (Integer[]) rs.getArray("tenants").getArray();
            assertArrayEquals(new Integer[] {tenantId}, tenants);
          }
        }

        /*
         * Update lease year.
         */
        String updateSql =
            """
            UPDATE public.lease
            SET year = ?
            WHERE lease_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
          stmt.setDate(1, Date.valueOf("2027-01-01"));
          stmt.setInt(2, leaseId);
          assertEquals(1, stmt.executeUpdate());
        }

        /*
         * Verify the update.
         */
        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, leaseId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals(Date.valueOf("2027-01-01"), rs.getDate("year"));
          }
        }

        /*
         * Delete child row first.
         *
         * Lease depends on Landlords and Properties, so Lease must be deleted
         * before deleting those parent rows.
         */
        deleteById(conn, "lease", "lease_id", leaseId);
        assertFalse(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));

        /*
         * Delete parent rows after the child row is gone.
         */
        deleteById(conn, "tenant", "tenant_id", tenantId);
        deleteById(conn, "properties", "property_id", propertyId);
        deleteById(conn, "landlords", "landlord_id", landlordId);
        deleteById(conn, "accounts", "account_id", accountId);
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectLeaseWithMissingLandlordForeignKey() throws Exception {
    int propertyId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int missingLandlordId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Insert only the property and tenant.
         * Do NOT insert the landlord.
         */
        insertProperty(conn, propertyId);
        insertTenant(conn, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Lease.landlord references Landlords.landlordID.
         * Since the landlord does not exist, this should fail.
         */
        assertThrows(
            SQLException.class,
            () -> insertLease(conn, leaseId, propertyId, missingLandlordId, tenantId));

        conn.rollback(savepoint);

        assertFalse(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectLeaseWithMissingPropertyForeignKey() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();
    int landlordId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int missingPropertyId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Insert account and landlord, but do NOT insert property.
         */
        insertAccount(conn, accountId);
        insertLandlord(conn, landlordId, accountId);
        insertTenant(conn, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Lease.property references Properties.propertyID.
         * Since the property does not exist, this should fail.
         */
        assertThrows(
            SQLException.class,
            () -> insertLease(conn, leaseId, missingPropertyId, landlordId, tenantId));

        conn.rollback(savepoint);

        assertFalse(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDuplicateLeaseId() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();
    int landlordId = DatabaseTestUtils.randomTestId();
    int propertyId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Insert all parent rows needed for a valid lease.
         */
        insertAccount(conn, accountId);
        insertLandlord(conn, landlordId, accountId);
        insertProperty(conn, propertyId);
        insertTenant(conn, tenantId);

        /*
         * First lease insert should work.
         */
        insertLease(conn, leaseId, propertyId, landlordId, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Second lease insert with same primary key should fail.
         */
        assertThrows(
            SQLException.class,
            () -> insertLease(conn, leaseId, propertyId, landlordId, tenantId));

        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDeletingLandlordWhileLeaseReferencesIt() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();
    int landlordId = DatabaseTestUtils.randomTestId();
    int propertyId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Create a valid lease connected to a landlord.
         */
        insertAccount(conn, accountId);
        insertLandlord(conn, landlordId, accountId);
        insertProperty(conn, propertyId);
        insertTenant(conn, tenantId);
        insertLease(conn, leaseId, propertyId, landlordId, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Try deleting the parent landlord while the lease still references it.
         *
         * This should fail if your FK is restrictive.
         * If it does not fail, your FK may be set to ON DELETE CASCADE.
         */
        assertThrows(SQLException.class, () -> deleteById(conn, "landlords", "landlord_id", landlordId));

        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));
        assertTrue(DatabaseTestUtils.rowExists(conn, "landlords", "landlord_id", landlordId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDeletingPropertyWhileLeaseReferencesIt() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();
    int landlordId = DatabaseTestUtils.randomTestId();
    int propertyId = DatabaseTestUtils.randomTestId();
    int tenantId = DatabaseTestUtils.randomTestId();
    int leaseId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Create a valid lease connected to a property.
         */
        insertAccount(conn, accountId);
        insertLandlord(conn, landlordId, accountId);
        insertProperty(conn, propertyId);
        insertTenant(conn, tenantId);
        insertLease(conn, leaseId, propertyId, landlordId, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Try deleting the parent property while the lease still references it.
         *
         * This should fail if your FK is restrictive.
         */
        assertThrows(SQLException.class, () -> deleteById(conn, "properties", "property_id", propertyId));

        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "lease", "lease_id", leaseId));
        assertTrue(DatabaseTestUtils.rowExists(conn, "properties", "property_id", propertyId));
      } finally {
        conn.rollback();
      }
    }
  }

  private static void insertLease(
      Connection conn, int leaseId, int propertyId, int landlordId, int tenantId)
      throws Exception {
    String sql =
        """
        INSERT INTO public.lease
        (lease_id, year, property, landlord, tenants)
        VALUES (?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      /*
       * Lease.tenants is stored as an int4 array in Postgres.
       */
      Array tenantsArray = conn.createArrayOf("int4", new Integer[] {tenantId});

      stmt.setInt(1, leaseId);
      stmt.setDate(2, Date.valueOf("2026-01-01"));
      stmt.setInt(3, propertyId);
      stmt.setInt(4, landlordId);
      stmt.setArray(5, tenantsArray);
      assertEquals(1, stmt.executeUpdate());
    }
  }

  private static void insertAccount(Connection conn, int accountId) throws Exception {
    String sql =
        """
        INSERT INTO public.accounts
        (account_id, email, gmail, icloud_account)
        VALUES (?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, accountId);
      stmt.setString(2, "account-" + accountId + "@example.com");
      stmt.setString(3, "gmail-" + accountId + "@gmail.com");
      stmt.setString(4, "icloud-" + accountId + "@icloud.com");
      assertEquals(1, stmt.executeUpdate());
    }
  }

  private static void insertLandlord(Connection conn, int landlordId, int accountId)
      throws Exception {
    String sql =
        """
        INSERT INTO public.landlords
        (landlord_id, business_id, first_name, last_name, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, landlordId);
      stmt.setInt(2, accountId);
      stmt.setString(3, "Lease");
      stmt.setString(4, "Landlord");
      stmt.setString(5, "123 Lease Landlord Street");
      stmt.setString(6, "555-222-3333");
      stmt.setString(7, "landlord-" + landlordId + "@example.com");
      assertEquals(1, stmt.executeUpdate());
    }
  }

  private static void insertProperty(Connection conn, int propertyId) throws Exception {
    String sql =
        """
        INSERT INTO public.properties
        (property_id, address, zoning, beds, baths, sqft, year_built, owner_email,
         owner_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, propertyId);
      stmt.setString(2, "123 Lease Property Street " + propertyId);
      stmt.setString(3, "Residential");
      stmt.setShort(4, (short) 3);
      stmt.setShort(5, (short) 2);
      stmt.setLong(6, 1400L);
      stmt.setDate(7, Date.valueOf("2001-01-01"));
      stmt.setString(8, "owner-" + propertyId + "@example.com");
      stmt.setString(9, "555-101-2020");
      assertEquals(1, stmt.executeUpdate());
    }
  }

  private static void insertTenant(Connection conn, int tenantId) throws Exception {
    String sql =
        """
        INSERT INTO public.tenant
        (tenant_id, first_name, last_name, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, tenantId);
      stmt.setString(2, "Lease");
      stmt.setString(3, "Tenant");
      stmt.setString(4, "123 Lease Tenant Street");
      stmt.setString(5, "555-777-8888");
      stmt.setString(6, "tenant-" + tenantId + "@example.com");
      assertEquals(1, stmt.executeUpdate());
    }
  }

  private static void deleteById(Connection conn, String tableName, String idColumn, int id)
      throws Exception {
    String sql = "DELETE FROM public.\"" + tableName + "\" WHERE \"" + idColumn + "\" = ?";

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, id);
      stmt.executeUpdate();
    }
  }
}