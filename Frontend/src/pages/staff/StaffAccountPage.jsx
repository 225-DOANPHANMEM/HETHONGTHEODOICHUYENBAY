import { useState } from "react";
import { staffInfo } from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffAccountPage() {
  const [info, setInfo] = useState(
    () => JSON.parse(localStorage.getItem("staffInfo") || "null") || staffInfo,
  );
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(info);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function saveInfo() {
    setInfo(form);
    localStorage.setItem("staffInfo", JSON.stringify(form));
    setEditing(false);
    alert("Đã lưu thông tin tài khoản.");
  }

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Staff Account</p>
          <h1 className="staff-page__title">Thông tin tài khoản</h1>
          <p className="staff-page__desc">
            Xem và chỉnh sửa thông tin cá nhân của nhân viên điều hành chuyến
            bay.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="staff-btn staff-btn--secondary"
            onClick={() => setShowPasswordModal(true)}
          >
            Đổi mật khẩu
          </button>
          <button
            className="staff-btn staff-btn--primary"
            onClick={() => {
              setForm(info);
              setEditing(true);
            }}
          >
            Chỉnh sửa
          </button>
        </div>
      </div>

      <section className="staff-detail-grid">
        <div className="staff-card">
          <div className="staff-card__body" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                margin: "0 auto 14px",
                background: "linear-gradient(135deg,#2563eb,#1e40af)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              NV
            </div>
            <h3 style={{ margin: 0 }}>{info.fullName}</h3>
            <p style={{ color: "#64748b", margin: "6px 0 0" }}>
              {info.position}
            </p>
            <span
              className="staff-status staff-status--success"
              style={{ marginTop: 14 }}
            >
              {info.status}
            </span>
          </div>
        </div>

        <div className="staff-card">
          <div className="staff-card__body">
            <h3 style={{ marginTop: 0 }}>Thông tin hồ sơ</h3>
            <div className="staff-info-list">
              <div className="staff-info-row">
                <span>Mã nhân viên</span>
                <span>{info.code}</span>
              </div>
              <div className="staff-info-row">
                <span>Họ tên</span>
                <span>{info.fullName}</span>
              </div>
              <div className="staff-info-row">
                <span>Ngày sinh</span>
                <span>{info.birthday}</span>
              </div>
              <div className="staff-info-row">
                <span>Giới tính</span>
                <span>{info.gender}</span>
              </div>
              <div className="staff-info-row">
                <span>CCCD</span>
                <span>{info.citizenId}</span>
              </div>
              <div className="staff-info-row">
                <span>Số điện thoại</span>
                <span>{info.phone}</span>
              </div>
              <div className="staff-info-row">
                <span>Email</span>
                <span>{info.email}</span>
              </div>
              <div className="staff-info-row">
                <span>Phòng ban</span>
                <span>{info.department}</span>
              </div>
              <div className="staff-info-row">
                <span>Ca làm việc</span>
                <span>{info.shift}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {editing && (
        <div className="staff-modal-backdrop" onClick={() => setEditing(false)}>
          <div
            className="staff-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-modal__header">
              <h3 style={{ margin: 0 }}>Chỉnh sửa thông tin tài khoản</h3>
              <button
                className="staff-btn staff-btn--secondary"
                onClick={() => setEditing(false)}
              >
                Đóng
              </button>
            </div>
            <div className="staff-card__body">
              <div
                className="staff-form-grid"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
              >
                <div className="staff-form-group">
                  <label>Mã nhân viên</label>
                  <input className="staff-input" value={form.code} readOnly />
                </div>
                <div className="staff-form-group">
                  <label>Họ tên</label>
                  <input
                    className="staff-input"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Ngày sinh</label>
                  <input
                    className="staff-input"
                    type="date"
                    value={form.birthday}
                    onChange={(e) => updateField("birthday", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Giới tính</label>
                  <select
                    className="staff-select"
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="staff-form-group">
                  <label>CCCD</label>
                  <input
                    className="staff-input"
                    value={form.citizenId}
                    onChange={(e) => updateField("citizenId", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Số điện thoại</label>
                  <input
                    className="staff-input"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Email</label>
                  <input
                    className="staff-input"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="staff-form-group">
                  <label>Ca làm việc</label>
                  <input
                    className="staff-input"
                    value={form.shift}
                    onChange={(e) => updateField("shift", e.target.value)}
                  />
                </div>
              </div>
              <div className="staff-form-group" style={{ marginTop: 14 }}>
                <label>Địa chỉ</label>
                <textarea
                  className="staff-textarea"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <button
                  className="staff-btn staff-btn--secondary"
                  onClick={() => setEditing(false)}
                >
                  Hủy
                </button>
                <button
                  className="staff-btn staff-btn--primary"
                  onClick={saveInfo}
                >
                  Lưu thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="staff-modal-backdrop"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="staff-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="staff-modal__header">
              <h3 style={{ margin: 0 }}>Đổi mật khẩu</h3>
              <button
                className="staff-btn staff-btn--secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Đóng
              </button>
            </div>
            <div className="staff-card__body">
              <div className="staff-form-group">
                <label>Mật khẩu hiện tại</label>
                <input className="staff-input" type="password" />
              </div>
              <div className="staff-form-group">
                <label>Mật khẩu mới</label>
                <input className="staff-input" type="password" />
              </div>
              <div className="staff-form-group">
                <label>Nhập lại mật khẩu mới</label>
                <input className="staff-input" type="password" />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 18,
                }}
              >
                <button
                  className="staff-btn staff-btn--primary"
                  onClick={() => {
                    alert("Đã đổi mật khẩu.");
                    setShowPasswordModal(false);
                  }}
                >
                  Lưu mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffAccountPage;
