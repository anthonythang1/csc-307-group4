package com.slorentalregistry.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
          .csrf(csrf -> csrf
			.ignoringRequestMatchers("/api/**")
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
          );
          // adjust authorization rules as needed:
          //.authorizeHttpRequests(auth -> auth
            //.anyRequest().authenticated()
          //);
          // keep form login or other auth mechanisms you already use:
          //.formLogin();

        return http.build();
    }
/*
// Simple CORS filter for local dev: allow frontend at :5173 to send credentials (cookies)
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

	class CsrfLoggingFilter extends OncePerRequestFilter {
  	private final Logger log = LoggerFactory.getLogger(CsrfLoggingFilter.class);

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, java.io.IOException {
    CsrfToken token = (CsrfToken) req.getAttribute(CsrfToken.class.getName());
    String header = req.getHeader("X-XSRF-TOKEN");
    log.info("CSRF token attr: {} | header: {}", token == null ? null : token.getToken(), header);
    chain.doFilter(req, res);
  }
}
*/
}
