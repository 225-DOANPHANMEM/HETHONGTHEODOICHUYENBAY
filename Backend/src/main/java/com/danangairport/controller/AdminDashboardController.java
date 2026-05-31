package com.danangairport.controller;

import com.danangairport.dto.DashboardTongQuanResponseDto;
import com.danangairport.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/tong-quan")
    public DashboardTongQuanResponseDto layTongQuan() {
        return adminDashboardService.layTongQuan();
    }
}
