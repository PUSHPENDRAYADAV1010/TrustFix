package com.trustfix.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustfix.security.JwtAuthenticationFilter;
import com.trustfix.security.ratelimit.InMemoryRateLimiter;
import com.trustfix.security.ratelimit.RateLimiter;
import com.trustfix.security.ratelimit.RateLimitingFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173}")
    private String allowedOriginsConfig;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ObjectMapper objectMapper) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.objectMapper = objectMapper;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RateLimiter rateLimiter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.login.max-requests:10}") int loginMax,
            @Value("${app.rate-limit.login.window-seconds:60}") long loginWindowSeconds,
            @Value("${app.rate-limit.register.max-requests:5}") int registerMax,
            @Value("${app.rate-limit.register.window-seconds:60}") long registerWindowSeconds) {
        return new InMemoryRateLimiter(enabled, loginMax, loginWindowSeconds, registerMax, registerWindowSeconds);
    }

    @Bean
    public RateLimitingFilter rateLimitingFilter(RateLimiter rateLimiter) {
        return new RateLimitingFilter(rateLimiter, objectMapper);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile);

        List<String> origins = new ArrayList<>();
        String envOrigins = System.getenv("APP_ALLOWED_ORIGINS");
        String effectiveOriginsStr = (envOrigins != null && !envOrigins.isBlank()) ? envOrigins : allowedOriginsConfig;

        if (effectiveOriginsStr != null && !effectiveOriginsStr.isBlank()) {
            for (String origin : effectiveOriginsStr.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty() && !origins.contains(trimmed)) {
                    origins.add(trimmed);
                }
            }
        }

        // In non-production profiles, allow local development ports
        if (!isProduction) {
            List<String> devOrigins = List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5173"
            );
            for (String devOrigin : devOrigins) {
                if (!origins.contains(devOrigin)) {
                    origins.add(devOrigin);
                }
            }
        }

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, RateLimitingFilter rateLimitingFilter) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    Map<String, Object> body = new HashMap<>();
                    body.put("timestamp", LocalDateTime.now().toString());
                    body.put("status", 401);
                    body.put("error", "Unauthorized");
                    body.put("message", "Authentication is required to access this resource: " + authException.getMessage());
                    objectMapper.writeValue(response.getOutputStream(), body);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    Map<String, Object> body = new HashMap<>();
                    body.put("timestamp", LocalDateTime.now().toString());
                    body.put("status", 403);
                    body.put("error", "Forbidden");
                    body.put("message", "Access Denied: You do not have permission to access this resource");
                    objectMapper.writeValue(response.getOutputStream(), body);
                })
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/actuator/health",
                    "/error"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/categories",
                    "/api/categories/**",
                    "/api/services",
                    "/api/services/**",
                    "/api/providers/verified",
                    "/api/providers/available",
                    "/api/providers/nearby",
                    "/api/providers/{id}",
                    "/api/provider-services/service/**",
                    "/api/reviews/provider/**"
                ).permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users/role/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users").hasRole("ADMIN")
                .requestMatchers("/api/providers/*/verify").hasRole("ADMIN")
                .requestMatchers("/api/bookings/status/**", "/api/bookings/*/assign-provider").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/categories", "/api/categories/**", "/api/services", "/api/services/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories", "/api/categories/**", "/api/services", "/api/services/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories", "/api/categories/**", "/api/services", "/api/services/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )

            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}