package com.slorentalregistry.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Savepoint;
import org.junit.jupiter.api.Test;

/**
 * Tests the Properties table.
 */
class PropertiesTableTest {

  @Test
  void shouldCreateReadUpdateAndDeleteProperty() throws Exception {
    int propertyId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * Verify the Properties table and expected columns exist.
         */
        DatabaseTestUtils.assertTableExists(conn, "properties");
        DatabaseTestUtils.assertPrimaryKeyExists(conn, "properties");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "property_id");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "address");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "zoning");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "beds");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "baths");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "sqft");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "year_built");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "owner_email");
        DatabaseTestUtils.assertColumnExists(conn, "properties", "owner_phone");

        /*
         * Properties does not depend on another table in your schema,
         * so it can be inserted directly.
         */
        insertProperty(conn, propertyId, 3, 2, 1500);

        /*
         * Verify the inserted property data.
         */
        String selectSql =
            """
            SELECT address, zoning, beds, baths, sqft, year_built, owner_email,
                   owner_phone
            FROM public.properties
            WHERE property_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, propertyId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("123 Property Street " + propertyId, rs.getString("address"));
            assertEquals("Residential", rs.getString("zoning"));
            assertEquals(3, rs.getInt("beds"));
            assertEquals(2, rs.getInt("baths"));
            assertEquals(1500L, rs.getLong("sqft"));
            assertEquals(Date.valueOf("2000-01-01"), rs.getDate("year_built"));
            assertEquals("owner-" + propertyId + "@example.com", rs.getString("owner_email"));
            assertEquals("555-333-4444", rs.getString("owner_phone"));
          }
        }

        /*
         * Update a few numeric property fields.
         */
        String updateSql =
            """
            UPDATE public.properties
            SET beds = ?, baths = ?, sqft = ?
            WHERE property_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
          stmt.setShort(1, (short) 4);
          stmt.setShort(2, (short) 3);
          stmt.setLong(3, 1750L);
          stmt.setInt(4, propertyId);
          assertEquals(1, stmt.executeUpdate());
        }

        /*
         * Delete the property and verify it is gone.
         */
        deleteById(conn, "properties", "property_id", propertyId);
        assertFalse(DatabaseTestUtils.rowExists(conn, "properties", "property_id", propertyId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDuplicatePropertyId() throws Exception {
    int propertyId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * First insert should succeed.
         */
        insertProperty(conn, propertyId, 3, 2, 1500);

        Savepoint savepoint = conn.setSavepoint();

        /*
         * Second insert with same propertyID should fail because propertyID is a primary key.
         */
        assertThrows(SQLException.class, () -> insertProperty(conn, propertyId, 4, 3, 1800));

        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "properties", "property_id", propertyId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectNullPropertyId() throws Exception {
    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        Savepoint savepoint = conn.setSavepoint();

        /*
         * propertyID is the primary key, so null should be rejected.
         */
        String sql =
            """
            INSERT INTO public.properties
            (property_id, address, zoning, beds, baths, sqft, year_built, owner_email,
            owner_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        assertThrows(
            SQLException.class,
            () -> {
              try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setObject(1, null);
                stmt.setString(2, "Null Property");
                stmt.setString(3, "Residential");
                stmt.setShort(4, (short) 3);
                stmt.setShort(5, (short) 2);
                stmt.setLong(6, 1500L);
                stmt.setDate(7, Date.valueOf("2000-01-01"));
                stmt.setString(8, "owner-null@example.com");
                stmt.setString(9, "555-000-0000");
                stmt.executeUpdate();
              }
            });

        conn.rollback(savepoint);
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectNegativeBedsBathsOrSqft() throws Exception {
    int propertyId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        Savepoint savepoint = conn.setSavepoint();

        /*
         * This test only passes if the database has CHECK constraints
         * that reject negative beds, baths, and square footage.
         *
         * If this test fails, it means your database currently allows invalid
         * property values, and you may need CHECK constraints.
         */
        assertThrows(SQLException.class, () -> insertProperty(conn, propertyId, -1, -1, -100));

        conn.rollback(savepoint);
      } finally {
        conn.rollback();
      }
    }
  }

  private static void insertProperty(Connection conn, int propertyId, int beds, int baths, long sqft)
      throws Exception {
    String sql =
        """
        INSERT INTO public.properties
        (property_id, address, zoning, beds, baths, sqft, year_built, owner_email,
         owner_phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, propertyId);
      stmt.setString(2, "123 Property Street " + propertyId);
      stmt.setString(3, "Residential");
      stmt.setShort(4, (short) beds);
      stmt.setShort(5, (short) baths);
      stmt.setLong(6, sqft);
      stmt.setDate(7, Date.valueOf("2000-01-01"));
      stmt.setString(8, "owner-" + propertyId + "@example.com");
      stmt.setString(9, "555-333-4444");
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