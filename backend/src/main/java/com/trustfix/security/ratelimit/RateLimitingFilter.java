package com.trustfix.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(RateLimiter rateLimiter, ObjectMapper objectMapper) {
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method)) {
            String action = null;
            if (path.endsWith("/api/auth/login")) {
                action = "login";
            } else if (path.endsWith("/api/auth/register")) {
                action = "register";
            }

            if (action != null) {
                String clientIp = extractClientIp(request);
                if (!rateLimiter.tryAcquire(clientIp, action)) {
                    long retryAfter = rateLimiter.getRemainingTimeSeconds(clientIp, action);
                    response.setStatus(429);
                    response.setContentType("application/json");
                    response.setHeader("Retry-After", String.valueOf(retryAfter));

                    Map<String, Object> errorBody = new HashMap<>();
                    errorBody.put("timestamp", LocalDateTime.now().toString());
                    errorBody.put("status", 429);
                    errorBody.put("error", "Too Many Requests");
                    errorBody.put("message", "Too many attempts. Please try again after " + retryAfter + " seconds.");

                    objectMapper.writeValue(response.getOutputStream(), errorBody);
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
