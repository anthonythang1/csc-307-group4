package com.slorentalregistry.backend.config;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Arrays;
import java.util.List;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final String allowedOrigins;
  private final String audience;
  private final String issuer;
  private final String jwtSecret;

  public SecurityConfig(
      @Value("${app.cors.allowed-origins}") String allowedOrigins,
      @Value("${app.supabase.audience}") String audience,
      @Value("${app.supabase.issuer}") String issuer,
      @Value("${app.supabase.jwt-secret}") String jwtSecret) {
    this.allowedOrigins = allowedOrigins;
    this.audience = audience;
    this.issuer = stripTrailingSlashes(issuer);
    this.jwtSecret = jwtSecret;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
      throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .sessionManagement(
            session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            auth ->
                auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            exceptions ->
                exceptions.authenticationEntryPoint(
                    (request, response, authException) -> {
                      response.setStatus(401);
                      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                      response
                          .getWriter()
                          .write(
                              """
                              {"error":"unauthorized","message":%s}
                              """
                                  .formatted(jsonString(authException.getMessage())));
                    }))
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

    return http.build();
  }

  @Bean
  public JwtDecoder jwtDecoder() {
    NimbusJwtDecoder jwksDecoder = jwksDecoder();
    jwksDecoder.setJwtValidator(jwtValidator());

    NimbusJwtDecoder hmacDecoder =
        jwtSecret.isBlank() ? null : hmacDecoder(jwtSecret.trim());

    if (hmacDecoder != null) {
      hmacDecoder.setJwtValidator(jwtValidator());
    }

    return token -> {
      String algorithm = jwtAlgorithm(token);

      if (algorithm.startsWith("HS")) {
        if (hmacDecoder == null) {
          throw new BadJwtException(
              "Supabase issued an HS token. Set SUPABASE_JWT_SECRET.");
        }

        return hmacDecoder.decode(token);
      }

      return jwksDecoder.decode(token);
    };
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(parseAllowedOrigins());
    configuration.setAllowedMethods(
        List.of("DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"));
    configuration.setAllowedHeaders(
        List.of("Authorization", "Content-Type", "X-Requested-With"));

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  private NimbusJwtDecoder hmacDecoder(String secret) {
    SecretKeySpec key =
        new SecretKeySpec(
            secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");

    return NimbusJwtDecoder.withSecretKey(key)
        .macAlgorithm(MacAlgorithm.HS256)
        .build();
  }

  private NimbusJwtDecoder jwksDecoder() {
    return NimbusJwtDecoder.withJwkSetUri(
            issuer + "/.well-known/jwks.json")
        .jwsAlgorithm(SignatureAlgorithm.RS256)
        .jwsAlgorithm(SignatureAlgorithm.ES256)
        .build();
  }

  private String jwtAlgorithm(String token) {
    try {
      return SignedJWT.parse(token).getHeader().getAlgorithm().getName();
    } catch (ParseException e) {
      throw new BadJwtException("Could not read JWT header.", e);
    }
  }

  private static String jsonString(String value) {
    if (value == null) {
      return "null";
    }

    return "\""
        + value
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
        + "\"";
  }

  private OAuth2TokenValidator<Jwt> jwtValidator() {
    OAuth2TokenValidator<Jwt> issuerValidator =
        JwtValidators.createDefaultWithIssuer(issuer);
    OAuth2TokenValidator<Jwt> audienceValidator =
        new AudienceValidator(audience);

    return new DelegatingOAuth2TokenValidator<>(
        issuerValidator, audienceValidator);
  }

  private List<String> parseAllowedOrigins() {
    return Arrays.stream(allowedOrigins.split(","))
        .map(String::trim)
        .filter(origin -> !origin.isBlank())
        .toList();
  }

  private static String stripTrailingSlashes(String value) {
    return value.replaceAll("/+$", "");
  }

  private record AudienceValidator(String audience)
      implements OAuth2TokenValidator<Jwt> {

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
      if (audience.isBlank() || jwt.getAudience().contains(audience)) {
        return OAuth2TokenValidatorResult.success();
      }

      OAuth2Error error =
          new OAuth2Error(
              "invalid_token", "The required audience is missing.", null);
      return OAuth2TokenValidatorResult.failure(error);
    }
  }
}
