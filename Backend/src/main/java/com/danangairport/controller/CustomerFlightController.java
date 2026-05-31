package com.danangairport.controller;

import com.danangairport.dto.CustomerFlightDto;
import com.danangairport.dto.CustomerNotificationDto;
import com.danangairport.service.CustomerFlightService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerFlightController {
    private final CustomerFlightService service;

    public CustomerFlightController(CustomerFlightService service) {
        this.service = service;
    }

    @GetMapping("/flights")
    public List<CustomerFlightDto> layDanhSachChuyenBay(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return service.layDanhSach(keyword, type, status, date);
    }

    @GetMapping("/flights/{identifier}")
    public CustomerFlightDto layChiTietChuyenBay(@PathVariable String identifier) {
        return service.layChiTiet(identifier);
    }

    @GetMapping("/notifications")
    public List<CustomerNotificationDto> layThongBao(
            @RequestParam(required = false, name = "flightNo") List<String> flightNos
    ) {
        return service.layThongBao(flightNos);
    }
}
