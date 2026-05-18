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
 * Tests the Landlords table based on the current database schema.
 *
 * businessID is treated as its own value, not as a foreign key to Accounts.
 */
class LandlordsTableTest {

  @Test
  void shouldCreateReadUpdateAndDeleteLandlord() throws Exception {
    int landlordId = DatabaseTestUtils.randomTestId();
    int businessId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      /*
       * Use a transaction so test data can be rolled back.
       */
      conn.setAutoCommit(false);

      try {
        /*
         * Verify the Landlords table structure exists.
         */
        DatabaseTestUtils.assertTableExists(conn, "landlords");
        DatabaseTestUtils.assertPrimaryKeyExists(conn, "landlords");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "landlord_id");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "business_id");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "first_name");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "last_name");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "address");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "phone");
        DatabaseTestUtils.assertColumnExists(conn, "landlords", "email");

        /*
         * Insert landlord directly.
         *
         * businessID is not linked to Accounts, so no Account row is needed.
         */
        insertLandlord(conn, landlordId, businessId);

        /*
         * Read landlord back and verify inserted values.
         */
        String selectSql =
            """
            SELECT business_id, first_name, last_name, address, phone, email
            FROM public.landlords
            WHERE landlord_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, landlordId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals(businessId, rs.getInt("business_id"));
            assertEquals("Test", rs.getString("first_name"));
            assertEquals("Landlord", rs.getString("last_name"));
            assertEquals("123 Landlord Street", rs.getString("address"));
            assertEquals("555-444-1111", rs.getString("phone"));
            assertEquals("landlord-" + landlordId + "@example.com", rs.getString("email"));
          }
        }

        /*
         * Update landlord phone number.
         */
        String updateSql =
            """
            UPDATE public.landlords
            SET phone = ?
            WHERE landlord_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
          stmt.setString(1, "555-999-0000");
          stmt.setInt(2, landlordId);
          assertEquals(1, stmt.executeUpdate());
        }

        /*
         * Verify update.
         */
        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, landlordId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("555-999-0000", rs.getString("phone"));
          }
        }

        /*
         * Delete landlord and verify it is gone.
         */
        deleteById(conn, "landlords", "landlord_id", landlordId);
        assertFalse(DatabaseTestUtils.rowExists(conn, "landlords", "landlord_id", landlordId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDuplicateLandlordId() throws Exception {
    int landlordId = DatabaseTestUtils.randomTestId();
    int businessId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * First insert should work.
         */
        insertLandlord(conn, landlordId, businessId);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Second insert with the same landlordID should fail because landlordID
         * is the primary key.
         */
        assertThrows(SQLException.class, () -> insertLandlord(conn, landlordId, businessId));

        /*
         * Roll back only the failed insert so the transaction can continue.
         */
        conn.rollback(savepoint);

        /*
         * Original landlord should still exist.
         */
        assertTrue(DatabaseTestUtils.rowExists(conn, "landlords", "landlord_id", landlordId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldDeleteMissingLandlordWithoutAffectingRows() throws Exception {
    int landlordId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Deleting a row that does not exist should delete zero rows.
         */
        String deleteSql =
            """
            DELETE FROM public.landlords
            WHERE landlord_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(deleteSql)) {
          stmt.setInt(1, landlordId);
          assertEquals(0, stmt.executeUpdate());
        }
      } finally {
        conn.rollback();
      }
    }
  }

  private static void insertLandlord(Connection conn, int landlordId, int businessId)
      throws Exception {
    /*
     * businessID is inserted as its own value.
     * This test does not assume it references Accounts.
     */
    String sql =
        """
        INSERT INTO public.landlords
        (landlord_id, business_id, first_name, last_name, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, landlordId);
      stmt.setInt(2, businessId);
      stmt.setString(3, "Test");
      stmt.setString(4, "Landlord");
      stmt.setString(5, "123 Landlord Street");
      stmt.setString(6, "555-444-1111");
      stmt.setString(7, "landlord-" + landlordId + "@example.com");

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