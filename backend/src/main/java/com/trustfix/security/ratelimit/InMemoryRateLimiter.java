package com.trustfix.security.ratelimit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryRateLimiter implements RateLimiter {

    private final boolean enabled;
    private final int loginMax;
    private final long loginWindowMs;
    private final int registerMax;
    private final long registerWindowMs;

    private final Map<String, Deque<Long>> requestHistory = new ConcurrentHashMap<>();

    public InMemoryRateLimiter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.login.max-requests:10}") int loginMax,
            @Value("${app.rate-limit.login.window-seconds:60}") long loginWindowSeconds,
            @Value("${app.rate-limit.register.max-requests:5}") int registerMax,
            @Value("${app.rate-limit.register.window-seconds:60}") long registerWindowSeconds) {
        this.enabled = enabled;
        this.loginMax = loginMax;
        this.loginWindowMs = loginWindowSeconds * 1000L;
        this.registerMax = registerMax;
        this.registerWindowMs = registerWindowSeconds * 1000L;
    }

    @Override
    public boolean tryAcquire(String clientKey, String action) {
        if (!enabled) {
            return true;
        }

        String key = buildAnonymizedKey(clientKey, action);
        long now = System.currentTimeMillis();
        long windowMs = "register".equalsIgnoreCase(action) ? registerWindowMs : loginWindowMs;
        int maxRequests = "register".equalsIgnoreCase(action) ? registerMax : loginMax;

        Deque<Long> timestamps = requestHistory.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (timestamps) {
            // Evict expired timestamps
            while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) > windowMs) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }

    @Override
    public long getRemainingTimeSeconds(String clientKey, String action) {
        if (!enabled) {
            return 0;
        }

        String key = buildAnonymizedKey(clientKey, action);
        long now = System.currentTimeMillis();
        long windowMs = "register".equalsIgnoreCase(action) ? registerWindowMs : loginWindowMs;

        Deque<Long> timestamps = requestHistory.get(key);
        if (timestamps == null) {
            return 0;
        }

        synchronized (timestamps) {
            Long oldest = timestamps.peekFirst();
            if (oldest == null) {
                return 0;
            }
            long elapsed = now - oldest;
            long remainingMs = windowMs - elapsed;
            return remainingMs > 0 ? (remainingMs / 1000L) + 1 : 1;
        }
    }

    @Override
    public void reset(String clientKey, String action) {
        String key = buildAnonymizedKey(clientKey, action);
        requestHistory.remove(key);
    }

    /**
     * Anonymizes client identity via SHA-256 hash to avoid storing personal identifiers.
     */
    private String buildAnonymizedKey(String clientKey, String action) {
        String raw = (clientKey != null ? clientKey : "unknown") + ":" + action;
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(raw.hashCode());
        }
    }
}
