package com.slorentalregistry.backend.properties;

import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationRequest;
import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationResponse;
import java.sql.SQLException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
