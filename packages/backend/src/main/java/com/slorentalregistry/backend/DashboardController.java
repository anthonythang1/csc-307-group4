package com.slorentalregistry.backend;

import com.slorentalregistry.backend.auth.UserProfileService;
import java.sql.SQLException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Controller for policy maker dashboard analytics. */
@RestController
public class DashboardController {
  private final DashboardService dashboardService;
  private final UserProfileService userProfileService;

  public DashboardController(
      DashboardService dashboardService,
      UserProfileService userProfileService) {
    this.dashboardService = dashboardService;
    this.userProfileService = userProfileService;
  }

  /** Returns dashboard analytics for authorized city officials. */
  @GetMapping("/api/dashboard")
  public ResponseEntity<?> getDashboard(@AuthenticationPrincipal Jwt jwt)
      throws SQLException {
    if (jwt == null) {
      return ResponseEntity.status(401).body(new ErrorResponse("unauthorized"));
    }

    if (!userProfileService.isCityOfficial(jwt)) {
      return ResponseEntity.status(403).body(new ErrorResponse("forbidden"));
    }

    return ResponseEntity.ok(dashboardService.getDashboard());
  }

  /** Simple API error response. */
  public record ErrorResponse(String error) {}
}