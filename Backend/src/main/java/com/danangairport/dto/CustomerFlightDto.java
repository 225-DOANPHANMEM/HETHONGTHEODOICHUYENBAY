package com.danangairport.dto;

public record CustomerFlightDto(
        String id,
        String maLichTrinh,
        String maChuyenBay,
        String flightNo,
        String airline,
        String type,
        String typeText,
        String from,
        String to,
        String date,
        String scheduledTime,
        String estimatedTime,
        String scheduledDeparture,
        String scheduledArrival,
        String estimatedDeparture,
        String estimatedArrival,
        String actualDeparture,
        String actualArrival,
        String gate,
        String terminal,
        String carousel,
        String carouselTerminal,
        String status,
        String statusText,
        Integer delayMinutes,
        String note
) {
}
