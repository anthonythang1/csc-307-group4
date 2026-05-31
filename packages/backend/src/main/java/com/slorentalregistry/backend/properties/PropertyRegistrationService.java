package com.slorentalregistry.backend.properties;

import com.slorentalregistry.backend.auth.UserProfileService;
import com.slorentalregistry.backend.auth.UserProfileService.AuthenticatedUserResponse;
import com.slorentalregistry.backend.database.SupabaseDatabase;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
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
    PropertyIdentity propertyIdentity = propertyIdentity(request);

    try (Connection conn = database.connect()) {
      conn.setAutoCommit(false);

      try {
        AuthenticatedUserResponse profile = requireLandlord(jwt, conn);

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

  public List<LandlordPropertyResponse> listProperties(Jwt jwt)
      throws SQLException {
    try (Connection conn = database.connect()) {
      AuthenticatedUserResponse profile = requireLandlord(jwt, conn);
      return listLandlordProperties(conn, profile.landlordId());
    }
  }

  public LandlordPropertyResponse updateProperty(
      Jwt jwt, int propertyId, PropertyRegistrationRequest request)
      throws SQLException {
    PropertyIdentity propertyIdentity = propertyIdentity(request);

    try (Connection conn = database.connect()) {
      conn.setAutoCommit(false);

      try {
        AuthenticatedUserResponse profile = requireLandlord(jwt, conn);

        if (!propertyBelongsToLandlord(
            conn, propertyId, profile.landlordId())) {
          throw new ResponseStatusException(
              HttpStatus.NOT_FOUND, "Property not found.");
        }

        if (propertyAlreadyRegistered(conn, propertyIdentity, propertyId)) {
          throw new ResponseStatusException(
              HttpStatus.CONFLICT,
              "A property with that address, city, and zipcode is already registered.");
        }

        LandlordPropertyResponse updated =
            updateProperty(
                conn, propertyId, request, propertyIdentity, profile.email());
        conn.commit();

        return updated;
      } catch (SQLException | RuntimeException error) {
        conn.rollback();
        throw error;
      } finally {
        conn.setAutoCommit(true);
      }
    }
  }

  public void deleteProperty(Jwt jwt, int propertyId) throws SQLException {
    try (Connection conn = database.connect()) {
      conn.setAutoCommit(false);

      try {
        AuthenticatedUserResponse profile = requireLandlord(jwt, conn);

        if (!propertyBelongsToLandlord(
            conn, propertyId, profile.landlordId())) {
          throw new ResponseStatusException(
              HttpStatus.NOT_FOUND, "Property not found.");
        }

        removePropertyFromLandlord(conn, propertyId, profile.landlordId());
        deletePropertyRow(conn, propertyId);
        conn.commit();
      } catch (SQLException | RuntimeException error) {
        conn.rollback();
        throw error;
      } finally {
        conn.setAutoCommit(true);
      }
    }
  }

  private AuthenticatedUserResponse requireLandlord(Jwt jwt, Connection conn)
      throws SQLException {
    AuthenticatedUserResponse profile =
        userProfileService.resolveOrCreateLandlord(jwt, conn);

    if (!"LANDLORD".equals(profile.registryRole())
        || profile.landlordId() == null) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Only landlords can manage properties.");
    }

    return profile;
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

  private List<LandlordPropertyResponse> listLandlordProperties(
      Connection conn, int landlordId) throws SQLException {
    String sql =
        """
        SELECT
          p.property_id,
          p.address,
          p.city,
          p.zipcode,
          p.zoning,
          p.beds,
          p.baths,
          p.sqft,
          p.year_built,
          p.owner_email,
          p.owner_phone
        FROM public.properties p
        JOIN public.landlords l
          ON p.property_id = ANY(COALESCE(l.properties, ARRAY[]::integer[]))
        WHERE l.landlord_id = ?
        ORDER BY p.property_id
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setInt(1, landlordId);

      try (ResultSet rows = statement.executeQuery()) {
        List<LandlordPropertyResponse> properties = new ArrayList<>();

        while (rows.next()) {
          properties.add(readLandlordProperty(rows));
        }

        return properties;
      }
    }
  }

  private LandlordPropertyResponse updateProperty(
      Connection conn,
      int propertyId,
      PropertyRegistrationRequest request,
      PropertyIdentity propertyIdentity,
      String ownerEmail)
      throws SQLException {
    String sql =
        """
        UPDATE public.properties
        SET
          address = ?,
          city = ?,
          zipcode = ?,
          zoning = ?,
          beds = ?,
          baths = ?,
          sqft = ?,
          year_built = ?,
          owner_email = ?,
          owner_phone = ?
        WHERE property_id = ?
        RETURNING
          property_id,
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
      statement.setInt(11, propertyId);

      try (ResultSet rows = statement.executeQuery()) {
        if (!rows.next()) {
          throw new ResponseStatusException(
              HttpStatus.NOT_FOUND, "Property not found.");
        }

        return readLandlordProperty(rows);
      }
    }
  }

  private boolean propertyAlreadyRegistered(
      Connection conn, PropertyIdentity propertyIdentity) throws SQLException {
    return propertyAlreadyRegistered(conn, propertyIdentity, null);
  }

  private boolean propertyAlreadyRegistered(
      Connection conn,
      PropertyIdentity propertyIdentity,
      Integer excludedPropertyId)
      throws SQLException {
    String sql;
    if (excludedPropertyId == null) {
      sql =
          """
          SELECT 1
          FROM public.properties
          WHERE lower(trim(address)) = ?
            AND lower(trim(city)) = ?
            AND trim(zipcode) = ?
          LIMIT 1
          """;
    } else {
      sql =
          """
          SELECT 1
          FROM public.properties
          WHERE lower(trim(address)) = ?
            AND lower(trim(city)) = ?
            AND trim(zipcode) = ?
            AND property_id <> ?
          LIMIT 1
          """;
    }

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setString(1, propertyIdentity.normalizedAddress());
      statement.setString(2, propertyIdentity.normalizedCity());
      statement.setString(3, propertyIdentity.normalizedZipcode());

      if (excludedPropertyId != null) {
        statement.setInt(4, excludedPropertyId);
      }

      try (ResultSet rows = statement.executeQuery()) {
        return rows.next();
      }
    }
  }

  private boolean propertyBelongsToLandlord(
      Connection conn, int propertyId, int landlordId) throws SQLException {
    String sql =
        """
        SELECT 1
        FROM public.landlords
        WHERE landlord_id = ?
          AND ? = ANY(COALESCE(properties, ARRAY[]::integer[]))
        LIMIT 1
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setInt(1, landlordId);
      statement.setInt(2, propertyId);

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

  private void removePropertyFromLandlord(
      Connection conn, int propertyId, int landlordId) throws SQLException {
    String sql =
        """
        UPDATE public.landlords
        SET properties = array_remove(
          COALESCE(properties, ARRAY[]::integer[]),
          ?
        )
        WHERE landlord_id = ?
          AND ? = ANY(COALESCE(properties, ARRAY[]::integer[]))
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setInt(1, propertyId);
      statement.setInt(2, landlordId);
      statement.setInt(3, propertyId);

      int rowsUpdated = statement.executeUpdate();
      if (rowsUpdated != 1) {
        throw new SQLException("Removing property from landlord failed.");
      }
    }
  }

  private void deletePropertyRow(Connection conn, int propertyId)
      throws SQLException {
    String sql =
        """
        DELETE FROM public.properties
        WHERE property_id = ?
        """;

    try (PreparedStatement statement = conn.prepareStatement(sql)) {
      statement.setInt(1, propertyId);

      int rowsDeleted = statement.executeUpdate();
      if (rowsDeleted != 1) {
        throw new SQLException("Deleting property failed.");
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

  private LandlordPropertyResponse readLandlordProperty(ResultSet rows)
      throws SQLException {
    return new LandlordPropertyResponse(
        rows.getInt("property_id"),
        rows.getString("address"),
        rows.getString("city"),
        rows.getString("zipcode"),
        rows.getString("zoning"),
        nullableInteger(rows, "beds"),
        nullableInteger(rows, "baths"),
        nullableLong(rows, "sqft"),
        rows.getString("year_built"),
        rows.getString("owner_email"),
        rows.getString("owner_phone"));
  }

  private Integer nullableInteger(ResultSet rows, String column)
      throws SQLException {
    int value = rows.getInt(column);
    return rows.wasNull() ? null : value;
  }

  private Long nullableLong(ResultSet rows, String column)
      throws SQLException {
    long value = rows.getLong(column);
    return rows.wasNull() ? null : value;
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

  public record LandlordPropertyResponse(
      int propertyId,
      String propAddress,
      String propCity,
      String propZipcode,
      String propZoning,
      Integer propNumBeds,
      Integer propNumBaths,
      Long propSqft,
      String propYearBuilt,
      String propOwnerEmail,
      String propOwnerPhone) {}

  private record PropertyIdentity(
      String address,
      String city,
      String zipcode,
      String normalizedAddress,
      String normalizedCity,
      String normalizedZipcode) {}
}
