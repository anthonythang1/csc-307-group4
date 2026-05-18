package com.slorentalregistry.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Savepoint;
import org.junit.jupiter.api.Test;

/**
 * Tests the Tenant table.
 */
class TenantTableTest {

  @Test
  void shouldCreateReadUpdateAndDeleteTenant() throws Exception {
    int tenantId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      /*
       * Use one transaction so all test data can be rolled back.
       */
      conn.setAutoCommit(false);

      try {
        /*
         * Verify the table structure exists.
         */
        DatabaseTestUtils.assertTableExists(conn, "tenant");
        DatabaseTestUtils.assertPrimaryKeyExists(conn, "tenant");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "tenant_id");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "first_name");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "last_name");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "address");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "phone");
        DatabaseTestUtils.assertColumnExists(conn, "tenant", "email");

        /*
         * Tenant has no parent foreign keys, so it can be inserted directly.
         */
        insertTenant(conn, tenantId);

        /*
         * Read the tenant back to verify the inserted values.
         */
        String selectSql =
            """
            SELECT first_name, last_name, address, phone, email
            FROM public.tenant
            WHERE tenant_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, tenantId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("Test", rs.getString("first_name"));
            assertEquals("Tenant", rs.getString("last_name"));
            assertEquals("123 Tenant Street", rs.getString("address"));
            assertEquals("555-100-2000", rs.getString("phone"));
            assertEquals("tenant-" + tenantId + "@example.com", rs.getString("email"));
          }
        }

        /*
         * Update the phone number to verify UPDATE works.
         */
        String updateSql =
            """
            UPDATE public.tenant
            SET phone = ?
            WHERE tenant_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
          stmt.setString(1, "555-999-8888");
          stmt.setInt(2, tenantId);
          assertEquals(1, stmt.executeUpdate());
        }

        /*
         * Read again to verify the updated value.
         */
        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, tenantId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("555-999-8888", rs.getString("phone"));
          }
        }

        /*
         * Delete the tenant and verify the row is gone.
         */
        deleteById(conn, "tenant", "tenant_id", tenantId);
        assertFalse(DatabaseTestUtils.rowExists(conn, "tenant", "tenant_id", tenantId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDuplicateTenantId() throws Exception {
    int tenantId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Insert once successfully.
         */
        insertTenant(conn, tenantId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Insert again with the same primary key.
         * This should fail because primary keys must be unique.
         */
        assertThrows(SQLException.class, () -> insertTenant(conn, tenantId));

        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "tenant", "tenant_id", tenantId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectNullTenantId() throws Exception {
    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        Savepoint savepoint = conn.setSavepoint();

        /*
         * tenantID is the primary key, so null should not be allowed.
         */
        String sql =
            """
            INSERT INTO public.tenant
            (tenant_id, first_name, last_name, address, phone, email)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        assertThrows(
            SQLException.class,
            () -> {
              try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setObject(1, null);
                stmt.setString(2, "Null");
                stmt.setString(3, "Tenant");
                stmt.setString(4, "123 Null Street");
                stmt.setString(5, "555-000-0000");
                stmt.setString(6, "null-tenant@example.com");
                stmt.executeUpdate();
              }
            });

        conn.rollback(savepoint);
      } finally {
        conn.rollback();
      }
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
      stmt.setString(2, "Test");
      stmt.setString(3, "Tenant");
      stmt.setString(4, "123 Tenant Street");
      stmt.setString(5, "555-100-2000");
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