package com.slorentalregistry.backend.properties;

import com.slorentalregistry.backend.auth.UserProfileService;
import com.slorentalregistry.backend.auth.UserProfileService.AuthenticatedUserResponse;
import com.slorentalregistry.backend.database.SupabaseDatabase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PropertyRegistrationService {

  private final SupabaseDatabase database;
  private final UserProfileService userProfileService;

  public PropertyRegistrationService(
      SupabaseDatabase database, UserProfileService userProfileService) {
    this.database = database;
    this.userProfileService = userProfileService;
  }

  public PropertyRegistrationResponse createProperty(
      Jwt jwt, PropertyRegistrationRequest request) throws SQLException {
    AuthenticatedUserResponse profile =
        userProfileService.resolveOrCreateLandlord(jwt);

    if (!"LANDLORD".equals(profile.registryRole())
        || profile.landlordId() == null) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only landlords can register properties.");
    }

    PropertyIdentity propertyIdentity = propertyIdentity(request);

    try (Connection conn = database.connect()) {
      conn.setAutoCommit(false);

      try {
        if (propertyAlreadyRegistered(conn, propertyIdentity)) {
          throw new ResponseStatusException(
              HttpStatus.CONFLICT,
              "A property with that address, city, and zipcode is already registered.");
        }

        int propertyId =
            insertProperty(conn, request, propertyIdentity, profile.email());
        appendPropertyToLandlord(conn, propertyId, profile.landlordId());
        conn.commit();

        return new PropertyRegistrationResponse(
            propertyId,
            profile.landlordId(),
            propertyIdentity.address());
      } catch (SQLException | RuntimeException error) {
        conn.rollback();
        throw error;
      } finally {
        conn.setAutoCommit(true);
      }
    }
  }

  private int insertProperty(
      Connection conn,
      PropertyRegistrationRequest request,
      PropertyIdentity propertyIdentity,
      String ownerEmail)
      throws SQLException {
    String sql =
        """
        INSERT INTO public.properties
        (
          address,
          city,
          zipcode,
          zoning,
          beds,
          baths,
          sqft,
          year_built,
          owner_email,
          owner_phone
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING property_id
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setString(1, propertyIdentity.address());
      statement.setString(2, propertyIdentity.city());
      statement.setString(3, propertyIdentity.zipcode());
      statement.setString(4, defaultText(request.propZoning()));
      statement.setShort(5, parseSmallint(request.propNumBeds(), "Bedrooms"));
      statement.setShort(6, parseSmallint(request.propNumBaths(), "Baths"));
      statement.setLong(7, parseLong(request.propSqft(), "Sqft"));
      statement.setString(8, defaultText(request.propYearBuilt()));
      statement.setString(9, fallbackText(request.propOwnerEmail(), ownerEmail));
      statement.setString(10, defaultText(request.propOwnerPhone()));

      try (ResultSet rows = statement.executeQuery()) {
        if (!rows.next()) {
          throw new SQLException("Creating property did not return an id.");
        }

        return rows.getInt("property_id");
      }
    }
  }

  private boolean propertyAlreadyRegistered(
      Connection conn, PropertyIdentity propertyIdentity) throws SQLException {
    String sql =
        """
        SELECT 1
        FROM public.properties
        WHERE lower(trim(address)) = ?
          AND lower(trim(city)) = ?
          AND trim(zipcode) = ?
        LIMIT 1
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setString(1, propertyIdentity.normalizedAddress());
      statement.setString(2, propertyIdentity.normalizedCity());
      statement.setString(3, propertyIdentity.normalizedZipcode());

      try (ResultSet rows = statement.executeQuery()) {
        return rows.next();
      }
    }
  }

  private void appendPropertyToLandlord(
      Connection conn, int propertyId, int landlordId) throws SQLException {
    String sql =
        """
        UPDATE public.landlords
        SET properties = array_append(
          COALESCE(properties, ARRAY[]::integer[]),
          ?
        )
        WHERE landlord_id = ?
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setInt(1, propertyId);
      statement.setInt(2, landlordId);

      int rowsUpdated = statement.executeUpdate();
      if (rowsUpdated != 1) {
        throw new SQLException("Appending property to landlord failed.");
      }
    }
  }

  private String requiredText(String value, String label) {
    if (value == null || value.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, label + " is required.");
    }

    return value.trim();
  }

  private String defaultText(String value) {
    return value == null ? "" : value.trim();
  }

  private String fallbackText(String value, String fallback) {
    String text = defaultText(value);
    return text.isBlank() ? defaultText(fallback) : text;
  }

  private PropertyIdentity propertyIdentity(PropertyRegistrationRequest request) {
    String address = requiredText(request.propAddress(), "Address");
    String city = requiredText(request.propCity(), "City");
    String zipcode = requiredText(request.propZipcode(), "Zipcode");

    return new PropertyIdentity(
        address,
        city,
        zipcode,
        address.toLowerCase(Locale.ROOT),
        city.toLowerCase(Locale.ROOT),
        zipcode);
  }

  private short parseSmallint(Object value, String label) {
    long parsed = parseLong(value, label);

    if (parsed > Short.MAX_VALUE) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, label + " is too large.");
    }

    return (short) parsed;
  }

  private long parseLong(Object value, String label) {
    String text = value == null ? "0" : value.toString().trim();

    if (text.isBlank()) {
      text = "0";
    }

    try {
      long parsed = Long.parseLong(text);

      if (parsed < 0) {
        throw new NumberFormatException("negative");
      }

      return parsed;
    } catch (NumberFormatException error) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          label + " must be a non-negative whole number.");
    }
  }

  public record PropertyRegistrationRequest(
      String propID,
      String propAddress,
      String propCity,
      String propZipcode,
      String propZoning,
      Object propNumBeds,
      Object propNumBaths,
      Object propSqft,
      String propYearBuilt,
      String propOwnerEmail,
      String propOwnerPhone) {}

  public record PropertyRegistrationResponse(
      int propertyId,
      int landlordId,
      String address) {}

  private record PropertyIdentity(
      String address,
      String city,
      String zipcode,
      String normalizedAddress,
      String normalizedCity,
      String normalizedZipcode) {}
}
