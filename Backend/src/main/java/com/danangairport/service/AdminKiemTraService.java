package com.danangairport.service;

import com.danangairport.repository.ChuyenBayRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminKiemTraService {

    private final ChuyenBayRepository chuyenBayRepository;

    public AdminKiemTraService(ChuyenBayRepository chuyenBayRepository) {
        this.chuyenBayRepository = chuyenBayRepository;
    }

    public long demSoChuyenBay() {
        return chuyenBayRepository.demSoChuyenBay();
    }
}
