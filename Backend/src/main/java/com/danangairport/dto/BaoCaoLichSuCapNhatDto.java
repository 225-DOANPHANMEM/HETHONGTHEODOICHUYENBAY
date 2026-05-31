package com.danangairport.dto;

import java.util.List;

public record BaoCaoLichSuCapNhatDto(
        long tongLichSuCapNhat,
        List<TopTaiKhoanCapNhat> topTaiKhoanCapNhat
) {
    public record TopTaiKhoanCapNhat(
            String maTaiKhoan,
            String tenDangNhap,
            String vaiTro,
            long soLanCapNhat
    ) {
    }
}
