package com.slorentalregistry.backend.auth;

import com.slorentalregistry.backend.database.SupabaseDatabase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

  private final int defaultBusinessId;
  private final SupabaseDatabase database;

  public UserProfileService(
      SupabaseDatabase database,
      @Value("${app.landlord.default-business-id}") int defaultBusinessId) {
    this.database = database;
    this.defaultBusinessId = defaultBusinessId;
  }

  public AuthenticatedUserResponse resolveOrCreateLandlord(Jwt jwt)
      throws SQLException {
    UUID authUserId = UUID.fromString(jwt.getSubject());
    String email = jwt.getClaimAsString("email");

    try (Connection conn = database.connect()) {
      AuthenticatedUserResponse cityOfficial =
          findCityOfficial(conn, authUserId, email, jwt);

      if (cityOfficial != null) {
        return cityOfficial;
      }

      AuthenticatedUserResponse landlord =
          findLandlord(conn, authUserId, email, jwt);

      if (landlord != null) {
        return landlord;
      }

      int landlordId = createLandlord(conn, authUserId, email, jwt);
      return new AuthenticatedUserResponse(
          authUserId.toString(),
          email,
          jwt.getClaimAsString("role"),
          "LANDLORD",
          landlordId,
          null,
          true);
    }
  }

  private AuthenticatedUserResponse findCityOfficial(
      Connection conn, UUID authUserId, String email, Jwt jwt)
      throws SQLException {
    String sql =
        """
        SELECT city_id
        FROM public.city_official
        WHERE auth_user_id = ?
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setObject(1, authUserId);

      try (ResultSet rows = statement.executeQuery()) {
        if (!rows.next()) {
          return null;
        }

        return new AuthenticatedUserResponse(
            authUserId.toString(),
            email,
            jwt.getClaimAsString("role"),
            "CITY_OFFICIAL",
            null,
            rows.getInt("city_id"),
            false);
      }
    }
  }

  private AuthenticatedUserResponse findLandlord(
      Connection conn, UUID authUserId, String email, Jwt jwt)
      throws SQLException {
    String sql =
        """
        SELECT landlord_id
        FROM public.landlords
        WHERE auth_user_id = ?
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setObject(1, authUserId);

      try (ResultSet rows = statement.executeQuery()) {
        if (!rows.next()) {
          return null;
        }

        return new AuthenticatedUserResponse(
            authUserId.toString(),
            email,
            jwt.getClaimAsString("role"),
            "LANDLORD",
            rows.getInt("landlord_id"),
            null,
            false);
      }
    }
  }

  private int createLandlord(Connection conn, UUID authUserId, String email, Jwt jwt)
      throws SQLException {
    String sql =
        """
        INSERT INTO public.landlords
        (auth_user_id, business_id, first_name, last_name, email)
        VALUES (?, ?, ?, ?, ?)
        RETURNING landlord_id
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setObject(1, authUserId);
      statement.setInt(2, defaultBusinessId);
      statement.setString(3, userMetadata(jwt, "first_name"));
      statement.setString(4, userMetadata(jwt, "last_name"));
      statement.setString(5, email);

      try (ResultSet rows = statement.executeQuery()) {
        if (!rows.next()) {
          throw new SQLException("Creating landlord did not return an id.");
        }

        return rows.getInt("landlord_id");
      }
    }
  }

  private String userMetadata(Jwt jwt, String key) {
    Object metadata = jwt.getClaims().get("user_metadata");

    if (!(metadata instanceof Map<?, ?> metadataMap)) {
      return null;
    }

    Object value = metadataMap.get(key);
    return value instanceof String text && !text.isBlank() ? text : null;
  }

  public record AuthenticatedUserResponse(
      String userId,
      String email,
      String supabaseRole,
      String registryRole,
      Integer landlordId,
      Integer cityOfficialId,
      boolean createdProfile) {}
}
