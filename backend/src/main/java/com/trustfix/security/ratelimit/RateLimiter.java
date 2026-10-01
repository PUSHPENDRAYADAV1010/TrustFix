package com.trustfix.security.ratelimit;

public interface RateLimiter {

    /**
     * Attempts to acquire a permit for the specified client and action.
     *
     * @param clientKey Anonymized client identifier (e.g. IP address or client hash)
     * @param action    The action/endpoint type (e.g. "login" or "register")
     * @return true if the request is within rate limits and permitted, false if rate limit exceeded
     */
    boolean tryAcquire(String clientKey, String action);

    /**
     * Gets the number of seconds until the oldest request in the window expires.
     *
     * @param clientKey Anonymized client identifier
     * @param action    The action/endpoint type
     * @return Seconds until retry should be attempted
     */
    long getRemainingTimeSeconds(String clientKey, String action);

    /**
     * Resets rate limit records for a given client and action (e.g., on successful login).
     *
     * @param clientKey Anonymized client identifier
     * @param action    The action/endpoint type
     */
    void reset(String clientKey, String action);
}
