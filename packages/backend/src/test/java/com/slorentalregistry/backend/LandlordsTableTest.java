package com.slorentalregistry.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Random;
import org.junit.jupiter.api.Test;

public class LandlordsTableTest {

  private static final String URL =
      "jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require";

  private static final String USER = "postgres.mzumhqujajenpvbheoum";

  @Test
  void shouldAddAndRemoveLandlord() throws Exception {
    String password = System.getenv("SUPABASE_DB_PASSWORD");

    if (password == null || password.isBlank()) {
      throw new IllegalStateException("SUPABASE_DB_PASSWORD is not set.");
    }

    int testLandlordId = 900000000 + new Random().nextInt(999999);
    String testEmail = "test-landlord-" + testLandlordId + "@example.com";

    try (Connection conn = DriverManager.getConnection(URL, USER, password)) {
      cleanupTestLandlord(conn, testLandlordId, testEmail);

      String insertSql =
          """
          INSERT INTO public."Landlords"
          ("landlordID", "businessID", first_name, last_name, address, phone, email)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          """;

      try (PreparedStatement insert = conn.prepareStatement(insertSql)) {
        insert.setInt(1, testLandlordId);
        insert.setInt(2, 1);
        insert.setString(3, "Test");
        insert.setString(4, "Landlord");
        insert.setString(5, "123 Test Street");
        insert.setString(6, "555-555-5555");
        insert.setString(7, testEmail);

        int rowsInserted = insert.executeUpdate();
        assertEquals(1, rowsInserted);
      }

      String selectSql =
          """
          SELECT first_name, last_name, email
          FROM public."Landlords"
          WHERE "landlordID" = ?
          """;

      try (PreparedStatement select = conn.prepareStatement(selectSql)) {
        select.setInt(1, testLandlordId);

        try (ResultSet rs = select.executeQuery()) {
          assertTrue(rs.next());
          assertEquals("Test", rs.getString("first_name"));
          assertEquals("Landlord", rs.getString("last_name"));
          assertEquals(testEmail, rs.getString("email"));
        }
      }

      String deleteSql =
          """
          DELETE FROM public."Landlords"
          WHERE "landlordID" = ?
          """;

      try (PreparedStatement delete = conn.prepareStatement(deleteSql)) {
        delete.setInt(1, testLandlordId);

        int rowsDeleted = delete.executeUpdate();
        assertEquals(1, rowsDeleted);
      }

      try (PreparedStatement select = conn.prepareStatement(selectSql)) {
        select.setInt(1, testLandlordId);

        try (ResultSet rs = select.executeQuery()) {
          assertFalse(rs.next());
        }
      }
    }
  }

  private static void cleanupTestLandlord(
      Connection conn, int testLandlordId, String testEmail) throws Exception {
    String cleanupSql =
        """
        DELETE FROM public."Landlords"
        WHERE "landlordID" = ? OR email = ?
        """;

    try (PreparedStatement cleanup = conn.prepareStatement(cleanupSql)) {
      cleanup.setInt(1, testLandlordId);
      cleanup.setString(2, testEmail);
      cleanup.executeUpdate();
    }
  }
}