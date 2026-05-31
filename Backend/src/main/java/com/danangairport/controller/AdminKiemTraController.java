package com.danangairport.controller;

import com.danangairport.dto.SoChuyenBayResponseDto;
import com.danangairport.service.AdminKiemTraService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/kiem-tra")
public class AdminKiemTraController {

    private final AdminKiemTraService adminKiemTraService;

    public AdminKiemTraController(AdminKiemTraService adminKiemTraService) {
        this.adminKiemTraService = adminKiemTraService;
    }

    @GetMapping("/so-chuyen-bay")
    public SoChuyenBayResponseDto laySoChuyenBay() {
        return new SoChuyenBayResponseDto(adminKiemTraService.demSoChuyenBay());
    }
}
