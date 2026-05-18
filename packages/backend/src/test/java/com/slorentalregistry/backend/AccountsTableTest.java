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
 * Tests the Accounts table.
 */
class AccountsTableTest {

  @Test
  void shouldCreateReadUpdateAndDeleteAccount() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      /*
       * Turn off auto-commit so this test can roll back all changes at the end.
       * This keeps test data out of the real database.
       */
      conn.setAutoCommit(false);

      try {
        /*
         * Verify the table and columns exist before testing data behavior.
         */
        DatabaseTestUtils.assertTableExists(conn, "accounts");
        DatabaseTestUtils.assertPrimaryKeyExists(conn, "accounts");
        DatabaseTestUtils.assertColumnExists(conn, "accounts", "account_id");
        DatabaseTestUtils.assertColumnExists(conn, "accounts", "email");
        DatabaseTestUtils.assertColumnExists(conn, "accounts", "gmail");
        DatabaseTestUtils.assertColumnExists(conn, "accounts", "icloud_account");

        /*
         * Insert a fake account.
         */
        insertAccount(conn, accountId);

        /*
         * Read the account back to verify the inserted values were saved.
         */
        String selectSql =
            """
            SELECT email, gmail, icloud_account
            FROM public.accounts
            WHERE account_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, accountId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("account-" + accountId + "@example.com", rs.getString("email"));
            assertEquals("gmail-" + accountId + "@gmail.com", rs.getString("gmail"));
            assertEquals("icloud-" + accountId + "@icloud.com", rs.getString("icloud_account"));
          }
        }

        /*
         * Update one field to verify UPDATE works.
         */
        String updateSql =
            """
            UPDATE public.accounts
            SET gmail = ?
            WHERE account_id = ?
            """;

        try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
          stmt.setString(1, "updated-" + accountId + "@gmail.com");
          stmt.setInt(2, accountId);
          assertEquals(1, stmt.executeUpdate());
        }

        /*
         * Read again to verify the update actually changed the row.
         */
        try (PreparedStatement stmt = conn.prepareStatement(selectSql)) {
          stmt.setInt(1, accountId);

          try (ResultSet rs = stmt.executeQuery()) {
            assertTrue(rs.next());
            assertEquals("updated-" + accountId + "@gmail.com", rs.getString("gmail"));
          }
        }

        /*
         * Delete the account and verify it no longer exists.
         */
        deleteById(conn, "accounts", "account_id", accountId);
        assertFalse(DatabaseTestUtils.rowExists(conn, "accounts", "account_id", accountId));
      } finally {
        /*
         * Roll back any changes left over from the test.
         */
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectDuplicateAccountId() throws Exception {
    int accountId = DatabaseTestUtils.randomTestId();

    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        /*
         * First insert should work.
         */
        insertAccount(conn, accountId);

        /*
         * Savepoint allows us to recover after the expected SQL error.
         */
        Savepoint savepoint = conn.setSavepoint();

        /*
         * Second insert with the same primary key should fail.
         */
        assertThrows(SQLException.class, () -> insertAccount(conn, accountId));

        /*
         * PostgreSQL marks a transaction as failed after a SQL exception.
         * Roll back to the savepoint so the test can keep running.
         */
        conn.rollback(savepoint);

        assertTrue(DatabaseTestUtils.rowExists(conn, "accounts", "account_id", accountId));
      } finally {
        conn.rollback();
      }
    }
  }

  @Test
  void shouldRejectNullAccountId() throws Exception {
    try (Connection conn = DatabaseTestUtils.getConnection()) {
      conn.setAutoCommit(false);

      try {
        Savepoint savepoint = conn.setSavepoint();

        /*
         * Primary keys should not allow null values.
         */
        String sql =
            """
            INSERT INTO public.accounts
            (account_id, email, gmail, icloud_account)
            VALUES (?, ?, ?, ?)
            """;

        assertThrows(
            SQLException.class,
            () -> {
              try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setObject(1, null);
                stmt.setString(2, "null-account@example.com");
                stmt.setString(3, "null-account@gmail.com");
                stmt.setString(4, "null-account@icloud.com");
                stmt.executeUpdate();
              }
            });

        conn.rollback(savepoint);
      } finally {
        conn.rollback();
      }
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

  private static void deleteById(Connection conn, String tableName, String idColumn, int id)
      throws Exception {
    String sql = "DELETE FROM public.\"" + tableName + "\" WHERE \"" + idColumn + "\" = ?";

    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
      stmt.setInt(1, id);
      stmt.executeUpdate();
    }
  }
}