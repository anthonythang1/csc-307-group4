package com.slorentalregistry.backend.database;

import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SupabaseDatabase {

  private final DataSource dataSource;
  private final String dbPassword;

  public SupabaseDatabase(
      DataSource dataSource,
      @Value("${app.supabase.db-password}") String dbPassword) {
    this.dataSource = dataSource;
    this.dbPassword = dbPassword;
  }

  public Connection connect() throws SQLException {
    if (dbPassword == null || dbPassword.isBlank()) {
      throw new IllegalStateException("SUPABASE_DB_PASSWORD is not set.");
    }

    return dataSource.getConnection();
  }
}
