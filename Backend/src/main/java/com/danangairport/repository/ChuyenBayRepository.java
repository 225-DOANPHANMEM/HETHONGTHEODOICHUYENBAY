package com.danangairport.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ChuyenBayRepository {

    private final JdbcTemplate jdbcTemplate;

    public ChuyenBayRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long demSoChuyenBay() {
        Long soChuyenBay = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM CHUYENBAY", Long.class);
        return soChuyenBay != null ? soChuyenBay : 0L;
    }
}
