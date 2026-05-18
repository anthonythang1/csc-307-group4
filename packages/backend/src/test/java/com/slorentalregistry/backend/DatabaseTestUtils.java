package com.slorentalregistry.backend;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Shared helper methods for database tests.
 *
 * This file keeps repeated code out of the individual test files.
 */
public final class DatabaseTestUtils {

  public static final String URL =
      "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";

  public static final String USER = "postgres.mzumhqujajenpvbheoum";

  private DatabaseTestUtils() {}

  /**
   * Opens a connection to Supabase.
   *
   * The password comes from the SUPABASE_DB_PASSWORD environment variable so
   * that the password is not hard-coded into the test files.
   */
  public static Connection getConnection() throws Exception {
    String password = System.getenv("SUPABASE_DB_PASSWORD");

    if (password == null || password.isBlank()) {
      throw new IllegalStateException("SUPABASE_DB_PASSWORD is not set.");
    }

    return DriverManager.getConnection(URL, USER, password);
  }

  /**
   * Generates a large random ID.
   *
   * This helps avoid accidentally colliding with real IDs already in the
   * production database.
   */
  public static int randomTestId() {
    return 900000000 + (int) (Math.random() * 999999);
  }

  /**
   * Checks that a table exists.
   *
   * This catches cases where a table was renamed, deleted, or never created.
   */
  public static void assertTableExists(Connection conn, String tableName) throws Exception {
    String sql =
        """
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ?
        )
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setString(1, tableName);

      try (ResultSet rs = stmt.executeQuery()) {
        assertTrue(rs.next());
        assertTrue(rs.getBoolean(1), "Missing table: " + tableName);
      }
    }
  }

  /**
   * Checks that a column exists in a table.
   *
   * This catches schema changes that would break your backend queries.
   */
  public static void assertColumnExists(Connection conn, String tableName, String columnName)
      throws Exception {
    String sql =
        """
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ?
          AND column_name = ?
        )
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setString(1, tableName);
      stmt.setString(2, columnName);

      try (ResultSet rs = stmt.executeQuery()) {
        assertTrue(rs.next());
        assertTrue(rs.getBoolean(1), "Missing column: " + tableName + "." + columnName);
      }
    }
  }

  /**
   * Checks whether a specific row exists by ID.
   *
   * This is useful after inserts and deletes.
   */
  public static boolean rowExists(Connection conn, String tableName, String idColumn, int id)
      throws Exception {
    String sql = "SELECT COUNT(*) FROM public.\"" + tableName + "\" WHERE \"" + idColumn + "\" = ?";

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, id);

      try (ResultSet rs = stmt.executeQuery()) {
        assertTrue(rs.next());
        return rs.getInt(1) > 0;
      }
    }
  }

  /**
   * Checks that a table has a primary key.
   *
   * This matters because duplicate IDs should not be allowed.
   */
  public static void assertPrimaryKeyExists(Connection conn, String tableName) throws Exception {
    String sql =
        """
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE table_schema = 'public'
          AND table_name = ?
          AND constraint_type = 'PRIMARY KEY'
        )
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setString(1, tableName);

      try (ResultSet rs = stmt.executeQuery()) {
        assertTrue(rs.next());
        assertTrue(rs.getBoolean(1), "Missing primary key on table: " + tableName);
      }
    }
  }

  /**
   * Checks that a foreign key exists between two tables.
   *
   * This verifies the database relationship itself, not just that inserts work.
   */
  public static void assertForeignKeyExists(
      Connection conn, String fromTable, String fromColumn, String toTable, String toColumn)
      throws Exception {
    String sql =
        """
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = ?
          AND kcu.column_name = ?
          AND ccu.table_name = ?
          AND ccu.column_name = ?
        )
        """;

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setString(1, fromTable);
      stmt.setString(2, fromColumn);
      stmt.setString(3, toTable);
      stmt.setString(4, toColumn);

      try (ResultSet rs = stmt.executeQuery()) {
        assertTrue(rs.next());
        assertTrue(
            rs.getBoolean(1),
            "Missing FK: " + fromTable + "." + fromColumn + " -> " + toTable + "." + toColumn);
      }
    }
  }
}