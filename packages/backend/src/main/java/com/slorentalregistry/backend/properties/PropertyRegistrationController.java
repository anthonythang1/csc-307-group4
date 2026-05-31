package com.slorentalregistry.backend.properties;

import com.slorentalregistry.backend.properties.PropertyRegistrationService.LandlordPropertyResponse;
import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationRequest;
import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationResponse;
import java.sql.SQLException;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/properties")
public class PropertyRegistrationController {

  private final PropertyRegistrationService propertyRegistrationService;

  public PropertyRegistrationController(
      PropertyRegistrationService propertyRegistrationService) {
    this.propertyRegistrationService = propertyRegistrationService;
  }

  @PostMapping
  public PropertyRegistrationResponse createProperty(
      @AuthenticationPrincipal Jwt jwt,
      @RequestBody PropertyRegistrationRequest request)
      throws SQLException {
    return propertyRegistrationService.createProperty(jwt, request);
  }

  @GetMapping
  public List<LandlordPropertyResponse> listProperties(
      @AuthenticationPrincipal Jwt jwt) throws SQLException {
    return propertyRegistrationService.listProperties(jwt);
  }

  @PutMapping("/{propertyId}")
  public LandlordPropertyResponse updateProperty(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable int propertyId,
      @RequestBody PropertyRegistrationRequest request)
      throws SQLException {
    return propertyRegistrationService.updateProperty(jwt, propertyId, request);
  }

  @DeleteMapping("/{propertyId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteProperty(
      @AuthenticationPrincipal Jwt jwt,
      @PathVariable int propertyId)
      throws SQLException {
    propertyRegistrationService.deleteProperty(jwt, propertyId);
  }
}
