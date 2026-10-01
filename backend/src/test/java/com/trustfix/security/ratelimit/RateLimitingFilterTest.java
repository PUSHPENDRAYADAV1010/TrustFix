package com.trustfix.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitingFilterTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Filter allows requests within configured rate limits")
    void doFilter_WithinLimit_AllowsRequest() throws Exception {
        RateLimiter limiter = new InMemoryRateLimiter(true, 5, 60, 5, 60);
        RateLimitingFilter filter = new RateLimitingFilter(limiter, objectMapper);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.1.100");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        filter.doFilter(request, response, filterChain);

        assertEquals(200, response.getStatus());
    }

    @Test
    @DisplayName("Filter returns 429 Too Many Requests when limit is exceeded")
    void doFilter_ExceedsLimit_Returns429() throws Exception {
        RateLimiter limiter = new InMemoryRateLimiter(true, 2, 60, 2, 60);
        RateLimitingFilter filter = new RateLimitingFilter(limiter, objectMapper);

        MockHttpServletRequest request1 = new MockHttpServletRequest("POST", "/api/auth/login");
        request1.setRemoteAddr("10.10.10.10");
        filter.doFilter(request1, new MockHttpServletResponse(), new MockFilterChain());

        MockHttpServletRequest request2 = new MockHttpServletRequest("POST", "/api/auth/login");
        request2.setRemoteAddr("10.10.10.10");
        filter.doFilter(request2, new MockHttpServletResponse(), new MockFilterChain());

        MockHttpServletRequest request3 = new MockHttpServletRequest("POST", "/api/auth/login");
        request3.setRemoteAddr("10.10.10.10");
        MockHttpServletResponse response3 = new MockHttpServletResponse();
        MockFilterChain chain3 = new MockFilterChain();

        filter.doFilter(request3, response3, chain3);

        assertEquals(429, response3.getStatus());
        assertNotNull(response3.getHeader("Retry-After"));
        assertTrue(response3.getContentAsString().contains("Too Many Requests"));
    }
}
