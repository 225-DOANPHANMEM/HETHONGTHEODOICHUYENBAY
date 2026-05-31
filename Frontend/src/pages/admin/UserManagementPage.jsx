import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatNguoiDung,
  datLaiMatKhau,
  layChiTietNguoiDung,
  layDanhSachNguoiDung,
  layDanhSachTrangThai,
  layDanhSachVaiTro,
  layThongKeNguoiDung,
  themNguoiDung,
} from "../../api/nguoiDungApi.js";
import "../../styles/admin/UserManagementPage.css";

const ACCOUNT_STATUS = {
  active: "Hoạt động",
  locked: "Khóa",
  deactivated: "Ngừng sử dụng",
};

const emptyFilters = { keyword: "", vaiTro: "", trangThai: "" };
const emptyCreateForm = {
  tenDangNhap: "",
  matKhau: "",
  email: "",
  soDienThoai: "",
  vaiTro: "",
  trangThaiTaiKhoan: "",
};
const emptyEditForm = {
  email: "",
  soDienThoai: "",
  vaiTro: "",
  trangThaiTaiKhoan: "",
  lyDo: "",
  matKhauMoi: "",
};

const textFixes = {
  "Quáº£n trá»‹": "Quản trị",
  "Äiá»u phá»‘i": "Điều phối",
  "KhÃ¡ch hÃ ng": "Khách hàng",
  "Hoáº¡t Ä‘á»™ng": "Hoạt động",
  "KhÃ³a": "Khóa",
  "Ngá»«ng sá»­ dá»¥ng": "Ngừng sử dụng",
};

function normalizeText(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return textFixes[String(value)] || String(value);
}

function displayValue(value, fallback = "Chưa cập nhật") {
  const normalized = normalizeText(value);
  return normalized || fallback;
}

function requiresReason(status) {
  return status === ACCOUNT_STATUS.locked || status === ACCOUNT_STATUS.deactivated;
}

function UserManagementPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState(emptyEditForm);

  const roleOptions = useMemo(() => roles.map(normalizeText), [roles]);
  const statusOptions = useMemo(() => statuses.map(normalizeText), [statuses]);
  const isReasonRequired = editMode && requiresReason(editForm.trangThaiTaiKhoan);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUsers(appliedFilters);
    loadStats();
    loadActiveUsers();
  }, [appliedFilters]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");
      const [rolesData, statusesData] = await Promise.all([
        layDanhSachVaiTro(),
        layDanhSachTrangThai(),
      ]);
      const normalizedRoles = (rolesData || []).map(normalizeText);
      const normalizedStatuses = (statusesData || []).map(normalizeText);
      setRoles(normalizedRoles);
      setStatuses(normalizedStatuses);
      setCreateForm((prev) => ({
        ...prev,
        vaiTro: normalizedRoles[0] || "",
        trangThaiTaiKhoan: normalizedStatuses[0] || "",
      }));
      setEditForm((prev) => ({
        ...prev,
        vaiTro: normalizedRoles[0] || "",
        trangThaiTaiKhoan: normalizedStatuses[0] || "",
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(currentFilters) {
    try {
      setLoading(true);
      setError("");
      const data = await layDanhSachNguoiDung(currentFilters);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await layThongKeNguoiDung();
      setStats(data);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadActiveUsers() {
    try {
      const data = await layDanhSachNguoiDung({ trangThai: ACCOUNT_STATUS.active });
      setActiveUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function reloadData() {
    await Promise.all([loadUsers(appliedFilters), loadStats(), loadActiveUsers()]);
  }

  function onFilter() {
    setAppliedFilters(filters);
  }

  function onRefresh() {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSuccess("");
    setError("");
  }

  function applyQuickFilter(nextFilters) {
    const normalizedFilters = { ...emptyFilters, ...nextFilters };
    setFilters(normalizedFilters);
    setAppliedFilters(normalizedFilters);
    setSuccess("");
    setError("");
  }

  async function openDetail(user) {
    try {
      setLoading(true);
      const detail = await layChiTietNguoiDung(user.maTaiKhoan);
      setSelectedUser(detail);
      setDetailOpen(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditMode(false);
    setCreateForm({
      ...emptyCreateForm,
      vaiTro: roleOptions[0] || "",
      trangThaiTaiKhoan: statusOptions[0] || "",
    });
    setFormOpen(true);
  }

  function openEditModal(user) {
    setEditMode(true);
    setSelectedUser(user);
    setEditForm({
      email: user.email || "",
      soDienThoai: user.soDienThoai || "",
      vaiTro: normalizeText(user.vaiTro) || roleOptions[0] || "",
      trangThaiTaiKhoan: normalizeText(user.trangThaiTaiKhoan) || statusOptions[0] || "",
      lyDo: "",
      matKhauMoi: "",
    });
    setFormOpen(true);
  }

  function updateCreateForm(field, value) {
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  async function submitUserForm(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (editMode && isReasonRequired && !editForm.lyDo.trim()) {
      setError("Vui lòng nhập lý do khi khóa hoặc ngừng sử dụng tài khoản.");
      return;
    }

    try {
      setSubmitting(true);
      if (editMode && selectedUser) {
        const { matKhauMoi, ...accountPayload } = editForm;
        await capNhatNguoiDung(selectedUser.maTaiKhoan, {
          ...accountPayload,
          lyDo: accountPayload.lyDo.trim() || null,
        });
        if (matKhauMoi.trim()) {
          await datLaiMatKhau(selectedUser.maTaiKhoan, matKhauMoi.trim());
        }
        setSuccess("Cập nhật tài khoản thành công.");
      } else {
        await themNguoiDung(createForm);
        setSuccess("Thêm tài khoản thành công.");
      }
      setFormOpen(false);
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout activePage="users" onNavigate={onNavigate}>
      <section className="user-page">
        <div className="user-page__heading">
          <div>
            <h1>Người dùng & phân quyền</h1>
            <p>Quản lý tài khoản nội bộ sân bay, vai trò và trạng thái truy cập.</p>
          </div>
          <button className="primary-btn" type="button" onClick={openCreateModal}>
            <i className="fa-solid fa-user-plus" /> Thêm tài khoản
          </button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="stats-grid">
          <StatCard icon="fa-users" tone="blue" label="Tổng tài khoản" value={stats?.tongTaiKhoan ?? 0} onClick={() => applyQuickFilter(emptyFilters)} />
          <StatCard icon="fa-circle-check" tone="green" label="Đang hoạt động" value={stats?.soHoatDong ?? 0} onClick={() => applyQuickFilter({ trangThai: ACCOUNT_STATUS.active })} />
          <StatCard icon="fa-lock" tone="amber" label="Bị khóa" value={stats?.soBiKhoa ?? 0} onClick={() => applyQuickFilter({ trangThai: ACCOUNT_STATUS.locked })} />
          <StatCard icon="fa-user-slash" tone="red" label="Ngừng sử dụng" value={stats?.soNgungSuDung ?? 0} onClick={() => applyQuickFilter({ trangThai: ACCOUNT_STATUS.deactivated })} />
          <StatCard icon="fa-user-shield" tone="indigo" label="Quản trị" value={stats?.soQuanTri ?? 0} onClick={() => applyQuickFilter({ vaiTro: "Quản trị" })} />
          <StatCard icon="fa-diagram-project" tone="cyan" label="Điều phối" value={stats?.soDieuPhoi ?? 0} onClick={() => applyQuickFilter({ vaiTro: "Điều phối" })} />
          <StatCard icon="fa-user" tone="slate" label="Khách hàng" value={stats?.soKhachHang ?? 0} onClick={() => applyQuickFilter({ vaiTro: "Khách hàng" })} />
        </div>

        <div className="user-page__content-grid">
          <div className="panel user-list-panel">
            <div className="panel__header">
              <div>
                <h2>Danh sách tài khoản</h2>
                <p>Thông tin rút gọn, dùng biểu tượng xem để mở chi tiết.</p>
              </div>
            </div>
            <div className="filters">
              <input
                type="text"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                placeholder="Tìm tên đăng nhập, email, số điện thoại"
              />
              <select value={filters.vaiTro} onChange={(e) => setFilters({ ...filters, vaiTro: e.target.value })}>
                <option value="">Tất cả vai trò</option>
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <select value={filters.trangThai} onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}>
                <option value="">Tất cả trạng thái</option>
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <button type="button" onClick={onFilter}><i className="fa-solid fa-filter" /> Lọc</button>
              <button type="button" onClick={onRefresh}><i className="fa-solid fa-rotate-right" /> Làm mới</button>
            </div>

            {loading ? <p className="loading">Đang tải dữ liệu...</p> : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã tài khoản</th>
                      <th>Tên đăng nhập</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.maTaiKhoan}>
                        <td>{user.maTaiKhoan}</td>
                        <td>{displayValue(user.tenDangNhap)}</td>
                        <td>{displayValue(user.vaiTro)}</td>
                        <td><StatusBadge status={displayValue(user.trangThaiTaiKhoan)} /></td>
                        <td className="actions">
                          <button className="action-btn action-btn--view" type="button" onClick={() => openDetail(user)} aria-label="Xem chi tiết tài khoản">
                            <i className="fa-solid fa-eye" />
                          </button>
                          <button className="action-btn action-btn--edit" type="button" onClick={() => openEditModal(user)} aria-label="Cập nhật tài khoản">
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="panel active-accounts-panel">
            <div className="panel__header">
              <div>
                <h2>Tài khoản đang hoạt động</h2>
                <p>{activeUsers.length} tài khoản có quyền truy cập hiện tại.</p>
              </div>
              <span className="active-accounts-panel__icon">
                <i className="fa-solid fa-user-check" />
              </span>
            </div>
            <div className="active-account-list">
              {activeUsers.length === 0 && (
                <p className="loading">Không có tài khoản đang hoạt động.</p>
              )}
              {activeUsers.map((user) => (
                <button
                  className="active-account-item"
                  key={user.maTaiKhoan}
                  type="button"
                  onClick={() => openDetail(user)}
                >
                  <span className="active-account-item__avatar">
                    <i className="fa-solid fa-user" />
                  </span>
                  <span className="active-account-item__body">
                    <strong>{displayValue(user.tenDangNhap)}</strong>
                    <small>{displayValue(user.vaiTro)} · {user.maTaiKhoan}</small>
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {detailOpen && selectedUser && (
        <Modal title="Chi tiết tài khoản" onClose={() => setDetailOpen(false)}>
          <div className="account-detail">
            <div className="account-detail__summary">
              <span className="account-detail__avatar">
                <i className="fa-solid fa-user-shield" />
              </span>
              <div>
                <p>{selectedUser.maTaiKhoan}</p>
                <h4>{displayValue(selectedUser.tenDangNhap)}</h4>
              </div>
              <StatusBadge status={displayValue(selectedUser.trangThaiTaiKhoan)} />
            </div>
            <div className="account-detail__grid">
              <Info label="Vai trò" value={displayValue(selectedUser.vaiTro)} icon="fa-user-tag" />
              <Info label="Email" value={displayValue(selectedUser.email)} icon="fa-envelope" />
              <Info label="Số điện thoại" value={displayValue(selectedUser.soDienThoai)} icon="fa-phone" />
              <Info label="Ngày tạo" value={displayValue(selectedUser.ngayTao)} icon="fa-calendar-plus" />
              <Info label="Mã tài khoản" value={selectedUser.maTaiKhoan} icon="fa-id-card" />
              <Info label="Trạng thái" value={displayValue(selectedUser.trangThaiTaiKhoan)} icon="fa-signal" />
            </div>
          </div>
        </Modal>
      )}

      {formOpen && (
        <Modal title={editMode ? "Cập nhật tài khoản" : "Thêm tài khoản"} onClose={() => setFormOpen(false)}>
          <form onSubmit={submitUserForm} className="form">
            {editMode && selectedUser && (
              <div className="form__summary">
                <span>{selectedUser.maTaiKhoan}</span>
                <strong>{displayValue(selectedUser.tenDangNhap)}</strong>
              </div>
            )}

            {!editMode && (
              <label>
                <span>Tên đăng nhập</span>
                <input required value={createForm.tenDangNhap} onChange={(e) => updateCreateForm("tenDangNhap", e.target.value)} />
              </label>
            )}
            {!editMode && (
              <label>
                <span>Mật khẩu</span>
                <input required type="password" value={createForm.matKhau} onChange={(e) => updateCreateForm("matKhau", e.target.value)} />
              </label>
            )}
            <label>
              <span>Email</span>
              <input value={editMode ? editForm.email : createForm.email} onChange={(e) => editMode ? updateEditForm("email", e.target.value) : updateCreateForm("email", e.target.value)} />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input value={editMode ? editForm.soDienThoai : createForm.soDienThoai} onChange={(e) => editMode ? updateEditForm("soDienThoai", e.target.value) : updateCreateForm("soDienThoai", e.target.value)} />
            </label>
            <label>
              <span>Vai trò</span>
              <select value={editMode ? editForm.vaiTro : createForm.vaiTro} onChange={(e) => editMode ? updateEditForm("vaiTro", e.target.value) : updateCreateForm("vaiTro", e.target.value)}>
                {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label>
              <span>Trạng thái tài khoản</span>
              <select value={editMode ? editForm.trangThaiTaiKhoan : createForm.trangThaiTaiKhoan} onChange={(e) => editMode ? updateEditForm("trangThaiTaiKhoan", e.target.value) : updateCreateForm("trangThaiTaiKhoan", e.target.value)}>
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            {editMode && (
              <label className="form__wide">
                <span>{isReasonRequired ? "Lý do thay đổi trạng thái *" : "Lý do thay đổi trạng thái"}</span>
                <textarea
                  required={isReasonRequired}
                  placeholder="Bắt buộc khi khóa hoặc ngừng sử dụng tài khoản"
                  value={editForm.lyDo}
                  onChange={(e) => updateEditForm("lyDo", e.target.value)}
                />
              </label>
            )}

            {editMode && (
              <label className="form__wide">
                <span>Mật khẩu mới</span>
                <input
                  type="password"
                  placeholder="Để trống nếu không đặt lại mật khẩu"
                  value={editForm.matKhauMoi}
                  onChange={(e) => updateEditForm("matKhauMoi", e.target.value)}
                />
              </label>
            )}

            <div className="form__actions">
              <button disabled={submitting} type="button" className="secondary-btn" onClick={() => setFormOpen(false)}>Hủy</button>
              <button disabled={submitting} type="submit" className="primary-btn">
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, tone, label, value, onClick }) {
  return (
    <button className={`stat-card stat-card--${tone}`} type="button" onClick={onClick}>
      <i className={`fa-solid ${icon}`} />
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = normalizeText(status);
  const className = normalizedStatus === ACCOUNT_STATUS.active
    ? "status-badge status-badge--active"
    : normalizedStatus === ACCOUNT_STATUS.locked
      ? "status-badge status-badge--locked"
      : "status-badge status-badge--deactivated";

  return <span className={className}>{normalizedStatus}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__head">
          <h3>{title}</h3>
          <button onClick={onClose} type="button" aria-label="Đóng">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

function Info({ label, value, icon = "fa-circle-info" }) {
  return (
    <div className="info-row">
      <span className="info-row__icon">
        <i className={`fa-solid ${icon}`} />
      </span>
      <span className="info-row__content">
        <span>{label}</span>
        <strong>{displayValue(value)}</strong>
      </span>
    </div>
  );
}

export default UserManagementPage;
