package com.trustfix.security;

import com.trustfix.entity.User;
import com.trustfix.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationTime;

    public JwtService(
            @Value("${jwt.secret:}") String secretKey,
            @Value("${jwt.expiration-ms:86400000}") long expirationTime,
            @Value("${spring.profiles.active:default}") String activeProfile) {
        
        String keyToUse = secretKey != null ? secretKey.trim() : "";
        boolean isProduction = "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(activeProfile);

        if (keyToUse.isEmpty()) {
            if (isProduction) {
                throw new IllegalStateException("CRITICAL SECURITY ERROR: 'jwt.secret' (JWT_SECRET) is missing in production profile!");
            }
            keyToUse = "TrustFixDevOnlyEphemeralJwtSecretKeyForLocalTesting2026AtLeast32Bytes!";
        } else if (keyToUse.length() < 32) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: 'jwt.secret' (JWT_SECRET) must be at least 32 characters (256 bits) long.");
        } else if (isProduction && keyToUse.contains("DevOnlyEphemeral")) {
            throw new IllegalStateException("CRITICAL SECURITY ERROR: Ephemeral development JWT secret cannot be used in production profile!");
        }

        this.key = Keys.hmacShaKeyFor(keyToUse.getBytes(StandardCharsets.UTF_8));
        this.expirationTime = expirationTime;
    }

    public String generateToken(User user) {
        return generateToken(user.getEmail(), user.getId(), user.getRole());
    }

    public String generateToken(String email) {
        return generateToken(email, null, null);
    }

    public String generateToken(String email, Long userId, UserRole role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationTime);

        Map<String, Object> extraClaims = new HashMap<>();
        if (userId != null) {
            extraClaims.put("id", userId);
        }
        if (role != null) {
            extraClaims.put("role", role.name());
        }

        return Jwts.builder()
                .claims(extraClaims)
                .subject(email)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Object idObj = getClaims(token).get("id");
        if (idObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public String extractRole(String token) {
        Object roleObj = getClaims(token).get("role");
        return roleObj != null ? roleObj.toString() : null;
    }

    public boolean isTokenValid(String token, String email) {
        try {
            String tokenEmail = extractEmail(token);
            return tokenEmail.equals(email) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}