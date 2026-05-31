package com.danangairport.service;

import com.danangairport.dto.CustomerFlightDto;
import com.danangairport.dto.CustomerNotificationDto;
import com.danangairport.repository.CustomerFlightRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class CustomerFlightService {
    private static final Map<String, String> TYPE_MAP = Map.of(
            "DEN", "\u0110\u1ebfn",
            "DI", "\u0110i"
    );
    private static final Map<String, String> STATUS_MAP = Map.ofEntries(
            Map.entry("SCHEDULED", "\u0110\u00e3 l\u00ean l\u1ecbch"),
            Map.entry("CHECKIN", "\u0110ang l\u00e0m th\u1ee7 t\u1ee5c"),
            Map.entry("BOARDING", "\u0110ang l\u00ean m\u00e1y bay"),
            Map.entry("DEPARTED", "\u0110\u00e3 kh\u1edfi h\u00e0nh"),
            Map.entry("IN_AIR", "\u0110ang bay"),
            Map.entry("LANDED", "\u0110\u00e3 h\u1ea1 c\u00e1nh"),
            Map.entry("COMPLETED", "Ho\u00e0n th\u00e0nh"),
            Map.entry("DELAYED", "Ch\u1eadm chuy\u1ebfn"),
            Map.entry("CANCELLED", "H\u1ee7y chuy\u1ebfn")
    );

    private final CustomerFlightRepository repository;

    public CustomerFlightService(CustomerFlightRepository repository) {
        this.repository = repository;
    }

    public List<CustomerFlightDto> layDanhSach(String keyword, String type, String status, LocalDate date) {
        return repository.layDanhSach(
                trimToNull(keyword),
                mapFilter(type, TYPE_MAP),
                mapFilter(status, STATUS_MAP),
                date
        );
    }

    public CustomerFlightDto layChiTiet(String identifier) {
        if (!hasText(identifier)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ma chuyen bay khong hop le.");
        }
        return repository.layChiTiet(identifier.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay chuyen bay."));
    }

    public List<CustomerNotificationDto> layThongBao(List<String> flightNos) {
        return repository.layThongBao(flightNos);
    }

    private String mapFilter(String value, Map<String, String> mapping) {
        if (!hasText(value) || "ALL".equalsIgnoreCase(value.trim())) {
            return null;
        }
        String cleanValue = value.trim();
        return mapping.getOrDefault(cleanValue.toUpperCase(), cleanValue);
    }

    private String trimToNull(String value) {
        if (!hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
