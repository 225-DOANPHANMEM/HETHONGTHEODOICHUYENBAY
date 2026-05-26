package com.danangairport.service;

import com.danangairport.dto.DashboardTongQuanResponseDto;
import com.danangairport.repository.AdminDashboardRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    private final AdminDashboardRepository adminDashboardRepository;

    public AdminDashboardService(AdminDashboardRepository adminDashboardRepository) {
        this.adminDashboardRepository = adminDashboardRepository;
    }

    public DashboardTongQuanResponseDto layTongQuan() {
        return adminDashboardRepository.layTongQuan();
    }
}
