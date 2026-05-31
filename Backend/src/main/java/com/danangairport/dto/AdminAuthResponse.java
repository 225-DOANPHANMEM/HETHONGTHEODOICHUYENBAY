package com.danangairport.dto;

public record AdminAuthResponse<T>(
        boolean success,
        String message,
        T data
) {
    public static <T> AdminAuthResponse<T> ok(String message, T data) {
        return new AdminAuthResponse<>(true, message, data);
    }
}
