package com.trustfix.util;

import com.trustfix.exception.BadRequestException;

public class PasswordValidator {

    private PasswordValidator() {
    }

    /**
     * Validates that the password satisfies the TrustFix strong password policy:
     * - Minimum 8 characters
     * - At least one uppercase letter (A-Z)
     * - At least one lowercase letter (a-z)
     * - At least one numerical digit (0-9)
     *
     * @param password Plaintext password to validate
     * @throws BadRequestException if the password violates any policy rule
     */
    public static void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new BadRequestException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new BadRequestException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*\\d.*")) {
            throw new BadRequestException("Password must contain at least one number");
        }
    }

    /**
     * Non-throwing boolean check for password strength.
     *
     * @param password Plaintext password to check
     * @return true if valid according to policy, false otherwise
     */
    public static boolean isValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        return password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }
}
