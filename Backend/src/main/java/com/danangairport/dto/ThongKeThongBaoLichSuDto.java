package com.danangairport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ThongKeThongBaoLichSuDto(
        Long tongThongBao,
        Long soChoGui,
        Long soDaGui,
        Long soLoiGui,
        Long tongLichSuCapNhat,
        Long soCapNhatHomNay,
        Long soChuyenBayCham,
        Long soChuyenBayHuy
) {
    @JsonProperty("totalNotifications")
    public Long totalNotifications() {
        return tongThongBao;
    }

    @JsonProperty("pendingNotifications")
    public Long pendingNotifications() {
        return soChoGui;
    }

    @JsonProperty("sentNotifications")
    public Long sentNotifications() {
        return soDaGui;
    }

    @JsonProperty("failedNotifications")
    public Long failedNotifications() {
        return soLoiGui;
    }

    @JsonProperty("totalHistories")
    public Long totalHistories() {
        return tongLichSuCapNhat;
    }

    @JsonProperty("todayHistories")
    public Long todayHistories() {
        return soCapNhatHomNay;
    }
}
