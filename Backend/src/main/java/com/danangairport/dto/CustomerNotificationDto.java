package com.danangairport.dto;

public record CustomerNotificationDto(
        String id,
        String flightNo,
        String maLichTrinh,
        String title,
        String content,
        String status,
        String statusText,
        String createdAt
) {
}
