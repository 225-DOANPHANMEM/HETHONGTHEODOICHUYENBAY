package com.danangairport.dto;

import jakarta.validation.constraints.Size;

public record XoaChuyenBayRequest(
        @Size(max = 255, message = "Lý do xóa tối đa 255 ký tự")
        String lyDoXoa
) {
}
