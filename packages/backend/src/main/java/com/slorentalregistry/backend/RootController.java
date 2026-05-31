package com.slorentalregistry.backend;

import com.slorentalregistry.backend.auth.UserProfileService;
import com.slorentalregistry.backend.auth.UserProfileService.AuthenticatedUserResponse;
import java.sql.SQLException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api")
public class RootController {
  private final UserProfileService userProfileService;

  public RootController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping("/")
  public String home() {
    return "SLORR Backroot";
  }

  @GetMapping("/me")
  public AuthenticatedUserResponse authenticatedUser(
      @AuthenticationPrincipal Jwt jwt) throws SQLException {
    return userProfileService.resolveOrCreateLandlord(jwt);
  }
}
