package com.slorentalregistry.backend.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SupabaseDatabase {

  private final String dbPassword;
  private final String dbUrl;
  private final String dbUser;

  public SupabaseDatabase(
      @Value("${app.supabase.db-url}") String dbUrl,
      @Value("${app.supabase.db-user}") String dbUser,
      @Value("${app.supabase.db-password}") String dbPassword) {
    this.dbUrl = dbUrl;
    this.dbUser = dbUser;
    this.dbPassword = dbPassword;
  }

  public Connection connect() throws SQLException {
    if (dbPassword == null || dbPassword.isBlank()) {
      throw new IllegalStateException("SUPABASE_DB_PASSWORD is not set.");
    }

    return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
  }
}
