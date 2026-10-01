package com.trustfix.security.ratelimit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InMemoryRateLimiterTest {

    @Test
    @DisplayName("Requests within limit should be allowed")
    void tryAcquire_UnderLimit_ReturnsTrue() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(true, 3, 60, 2, 60);

        assertTrue(limiter.tryAcquire("192.168.1.1", "login"));
        assertTrue(limiter.tryAcquire("192.168.1.1", "login"));
        assertTrue(limiter.tryAcquire("192.168.1.1", "login"));
    }

    @Test
    @DisplayName("Requests exceeding limit should be rejected")
    void tryAcquire_ExceedsLimit_ReturnsFalse() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(true, 2, 60, 2, 60);

        assertTrue(limiter.tryAcquire("10.0.0.1", "login"));
        assertTrue(limiter.tryAcquire("10.0.0.1", "login"));
        assertFalse(limiter.tryAcquire("10.0.0.1", "login"), "Third request in 60s should exceed limit of 2");
        assertTrue(limiter.getRemainingTimeSeconds("10.0.0.1", "login") > 0);
    }

    @Test
    @DisplayName("Reset should clear history and allow subsequent request")
    void reset_ClearsHistory_AllowsAcquisition() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(true, 1, 60, 1, 60);

        assertTrue(limiter.tryAcquire("172.16.0.1", "login"));
        assertFalse(limiter.tryAcquire("172.16.0.1", "login"));

        limiter.reset("172.16.0.1", "login");
        assertTrue(limiter.tryAcquire("172.16.0.1", "login"), "Should be permitted after reset");
    }

    @Test
    @DisplayName("Disabled rate limiter should always return true")
    void tryAcquire_Disabled_AlwaysReturnsTrue() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter(false, 1, 60, 1, 60);

        for (int i = 0; i < 20; i++) {
            assertTrue(limiter.tryAcquire("any-client", "login"));
        }
    }
}
