package com.trustfix.util;

import com.trustfix.exception.BadRequestException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    @DisplayName("Valid password satisfying all criteria should succeed")
    void testValidPassword_Success() {
        assertDoesNotThrow(() -> PasswordValidator.validate("SecurePass123!"));
        assertTrue(PasswordValidator.isValid("SecurePass123!"));
        assertTrue(PasswordValidator.isValid("Test@123"));
        assertTrue(PasswordValidator.isValid("Admin@123"));
    }

    @Test
    @DisplayName("Password with less than 8 characters should throw BadRequestException")
    void testTooShortPassword_ThrowsException() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PasswordValidator.validate("Ab1!xyz"));
        assertTrue(ex.getMessage().contains("at least 8 characters"));
        assertFalse(PasswordValidator.isValid("Ab1!xyz"));
    }

    @Test
    @DisplayName("Password missing uppercase letter should throw BadRequestException")
    void testMissingUppercase_ThrowsException() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PasswordValidator.validate("nouppercase123"));
        assertTrue(ex.getMessage().contains("uppercase letter"));
        assertFalse(PasswordValidator.isValid("nouppercase123"));
    }

    @Test
    @DisplayName("Password missing lowercase letter should throw BadRequestException")
    void testMissingLowercase_ThrowsException() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PasswordValidator.validate("NOLOWERCASE123"));
        assertTrue(ex.getMessage().contains("lowercase letter"));
        assertFalse(PasswordValidator.isValid("NOLOWERCASE123"));
    }

    @Test
    @DisplayName("Password missing number should throw BadRequestException")
    void testMissingNumber_ThrowsException() {
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> PasswordValidator.validate("NoNumbersHere!"));
        assertTrue(ex.getMessage().contains("at least one number"));
        assertFalse(PasswordValidator.isValid("NoNumbersHere!"));
    }

    @Test
    @DisplayName("Null or empty/blank password should throw BadRequestException")
    void testNullOrEmptyPassword_ThrowsException() {
        assertThrows(BadRequestException.class, () -> PasswordValidator.validate(null));
        assertThrows(BadRequestException.class, () -> PasswordValidator.validate(""));
        assertThrows(BadRequestException.class, () -> PasswordValidator.validate("    "));
        assertFalse(PasswordValidator.isValid(null));
        assertFalse(PasswordValidator.isValid(""));
    }
}
