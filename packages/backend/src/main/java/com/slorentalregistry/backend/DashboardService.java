package com.slorentalregistry.backend;

import com.slorentalregistry.backend.database.SupabaseDatabase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** Service for loading dashboard analytics from Supabase. */
@Service
public class DashboardService {
  private final SupabaseDatabase database;

  public DashboardService(SupabaseDatabase database) {
    this.database = database;
  }

  /** Loads dashboard data from the public.properties table. */
  public DashboardResponse getDashboard() throws SQLException {
    try (Connection conn = database.connect()) {
      DashboardStats stats = loadStats(conn);
      List<PropertiesByCity> propertiesByCity = loadPropertiesByCity(conn);
      List<BedroomDistribution> bedroomDistribution =
          loadBedroomDistribution(conn);

      List<DashboardInsight> insights =
          List.of(
              new DashboardInsight(
                  "Dashboard data is coming from Supabase public.properties",
                  "Counts and averages are calculated directly from the property registry table.",
                  "database"),
              new DashboardInsight(
                  "Bedroom distribution uses the beds column",
                  "Studio units are properties with 0 beds. 4+ BR groups all properties with 4 or more beds.",
                  "bedrooms"),
              new DashboardInsight(
                  "City grouping uses the city column",
                  "Properties are grouped by the city value stored on each property record.",
                  "geographic"));

      return new DashboardResponse(
          stats,
          propertiesByCity,
          bedroomDistribution,
          insights);
    }
  }

  private DashboardStats loadStats(Connection conn) throws SQLException {
    String sql =
        """
        SELECT
          COUNT(*)::int AS total_registered_properties,
          COUNT(
            DISTINCT COALESCE(NULLIF(TRIM(city), ''), 'Unknown')
          )::int AS total_cities,
          COALESCE(ROUND(AVG(beds))::int, 0) AS average_beds,
          COALESCE(ROUND(AVG(baths))::int, 0) AS average_baths,
          COALESCE(ROUND(AVG(sqft))::bigint, 0) AS average_sqft
        FROM public.properties
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql);
        ResultSet rows = statement.executeQuery()) {
      if (!rows.next()) {
        return new DashboardStats(0, 0, 0, 0, 0);
      }

      return new DashboardStats(
          rows.getInt("total_registered_properties"),
          rows.getInt("total_cities"),
          rows.getInt("average_beds"),
          rows.getInt("average_baths"),
          rows.getLong("average_sqft"));
    }
  }

  private List<PropertiesByCity> loadPropertiesByCity(Connection conn)
      throws SQLException {
    String sql =
        """
        SELECT
        INITCAP(LOWER(COALESCE(NULLIF(TRIM(city), ''), 'Unknown'))) AS city,
        COUNT(*)::int AS property_count
        FROM public.properties
        GROUP BY LOWER(COALESCE(NULLIF(TRIM(city), ''), 'Unknown'))
        ORDER BY property_count DESC, city ASC
        """;

    List<PropertiesByCity> result = new ArrayList<>();

    try (PreparedStatement statement = conn.prepareStatement(sql);
        ResultSet rows = statement.executeQuery()) {
      while (rows.next()) {
        result.add(
            new PropertiesByCity(
                rows.getString("city"),
                rows.getInt("property_count")));
      }
    }

    return result;
  }

  private List<BedroomDistribution> loadBedroomDistribution(Connection conn)
      throws SQLException {
    String sql =
        """
        SELECT
          CASE
            WHEN beds = 0 THEN 'Studio'
            WHEN beds >= 4 THEN '4+ BR'
            ELSE beds::text || ' BR'
          END AS label,
          COUNT(*)::int AS property_count,
          MIN(beds) AS sort_order
        FROM public.properties
        WHERE beds IS NOT NULL
        GROUP BY
          CASE
            WHEN beds = 0 THEN 'Studio'
            WHEN beds >= 4 THEN '4+ BR'
            ELSE beds::text || ' BR'
          END
        ORDER BY sort_order
        """;

    List<BedroomDistribution> result = new ArrayList<>();

    try (PreparedStatement statement = conn.prepareStatement(sql);
        ResultSet rows = statement.executeQuery()) {
      while (rows.next()) {
        result.add(
            new BedroomDistribution(
                rows.getString("label"),
                rows.getInt("property_count")));
      }
    }

    return result;
  }

  /** Dashboard API response. */
  public record DashboardResponse(
      DashboardStats stats,
      List<PropertiesByCity> propertiesByCity,
      List<BedroomDistribution> bedroomDistribution,
      List<DashboardInsight> insights) {}

  /** Top-level dashboard statistics. */
  public record DashboardStats(
      int totalRegisteredProperties,
      int totalCities,
      int averageBeds,
      int averageBaths,
      long averageSqft) {}

  /** Property count grouped by city. */
  public record PropertiesByCity(String city, int propertyCount) {}

  /** Property count grouped by bedroom count. */
  public record BedroomDistribution(String label, int count) {}

  /** Dashboard insight text. */
  public record DashboardInsight(
      String title,
      String description,
      String type) {}
}