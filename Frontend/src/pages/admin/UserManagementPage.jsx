import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import {
  capNhatNguoiDung,
  datLaiMatKhau,
  khoaTaiKhoan,
  layChiTietNguoiDung,
  layDanhSachNguoiDung,
  layDanhSachTrangThai,
  layDanhSachVaiTro,
  layThongKeNguoiDung,
  moKhoaTaiKhoan,
  ngungSuDungTaiKhoan,
  themNguoiDung,
} from "../../api/nguoiDungApi.js";
import "../../styles/admin/UserManagementPage.css";

const emptyFilters = { keyword: "", vaiTro: "", trangThai: "" };
const emptyCreateForm = { tenDangNhap: "", matKhau: "", email: "", soDienThoai: "", vaiTro: "", trangThaiTaiKhoan: "" };
const emptyEditForm = { email: "", soDienThoai: "", vaiTro: "", trangThaiTaiKhoan: "" };

function UserManagementPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
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
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [lockOpen, setLockOpen] = useState(false);
  const [lockReason, setLockReason] = useState("");

  const roleOptions = useMemo(() => roles, [roles]);
  const statusOptions = useMemo(() => statuses, [statuses]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadUsers(appliedFilters);
    loadStats();
  }, [appliedFilters]);

  async function loadInitialData() {
    try {
      setLoading(true);
      setError("");
      const [rolesData, statusesData] = await Promise.all([layDanhSachVaiTro(), layDanhSachTrangThai()]);
      setRoles(rolesData || []);
      setStatuses(statusesData || []);
      setCreateForm((prev) => ({
        ...prev,
        vaiTro: rolesData?.[0] || "",
        trangThaiTaiKhoan: statusesData?.[0] || "",
      }));
      setEditForm((prev) => ({
        ...prev,
        vaiTro: rolesData?.[0] || "",
        trangThaiTaiKhoan: statusesData?.[0] || "",
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
      setUsers(data || []);
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

  async function reloadData() {
    await Promise.all([loadUsers(appliedFilters), loadStats()]);
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
      vaiTro: roles[0] || "",
      trangThaiTaiKhoan: statuses[0] || "",
    });
    setFormOpen(true);
  }

  function openEditModal(user) {
    setEditMode(true);
    setSelectedUser(user);
    setEditForm({
      email: user.email || "",
      soDienThoai: user.soDienThoai || "",
      vaiTro: user.vaiTro || roles[0] || "",
      trangThaiTaiKhoan: user.trangThaiTaiKhoan || statuses[0] || "",
    });
    setFormOpen(true);
  }

  async function submitUserForm(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      if (editMode && selectedUser) {
        await capNhatNguoiDung(selectedUser.maTaiKhoan, editForm);
        setSuccess("Cap nhat tai khoan thanh cong");
      } else {
        await themNguoiDung(createForm);
        setSuccess("Them tai khoan thanh cong");
      }
      setFormOpen(false);
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggleLock(user) {
    try {
      setSubmitting(true);
      if (user.trangThaiTaiKhoan === "Khóa") {
        await moKhoaTaiKhoan(user.maTaiKhoan);
        setSuccess("Mo khoa tai khoan thanh cong");
      } else {
        setSelectedUser(user);
        setLockReason("");
        setLockOpen(true);
        return;
      }
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitLock() {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      await khoaTaiKhoan(selectedUser.maTaiKhoan, lockReason);
      setSuccess("Khoa tai khoan thanh cong");
      setLockOpen(false);
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onDeactivate(user) {
    try {
      setSubmitting(true);
      await ngungSuDungTaiKhoan(user.maTaiKhoan);
      setSuccess("Ngung su dung tai khoan thanh cong");
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function submitResetPassword() {
    if (!selectedUser || !newPassword.trim()) return;
    try {
      setSubmitting(true);
      await datLaiMatKhau(selectedUser.maTaiKhoan, newPassword.trim());
      setSuccess("Dat lai mat khau thanh cong");
      setResetPasswordOpen(false);
      setNewPassword("");
      await reloadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const displayValue = (value) => (value ? value : "Chua cap nhat");

  return (
    <AdminLayout activePage="users" onNavigate={onNavigate}>
      <section className="user-page">
        <div className="user-page__heading">
          <div>
            <h1>Nguoi dung & phan quyen</h1>
            <p>Quan ly tai khoan noi bo san bay, vai tro va trang thai truy cap.</p>
          </div>
          <button className="primary-btn" type="button" onClick={openCreateModal}>
            <i className="fa-solid fa-user-plus" /> Them tai khoan
          </button>
        </div>

        {error && <div className="alert alert--error">{error}</div>}
        {success && <div className="alert alert--success">{success}</div>}

        <div className="stats-grid">
          <StatCard icon="fa-users" label="Tong tai khoan" value={stats?.tongTaiKhoan ?? 0} />
          <StatCard icon="fa-circle-check" label="Dang hoat dong" value={stats?.soHoatDong ?? 0} />
          <StatCard icon="fa-lock" label="Bi khoa" value={stats?.soBiKhoa ?? 0} />
          <StatCard icon="fa-user-slash" label="Ngung su dung" value={stats?.soNgungSuDung ?? 0} />
          <StatCard icon="fa-user-shield" label="Quan tri" value={stats?.soQuanTri ?? 0} />
          <StatCard icon="fa-diagram-project" label="Dieu phoi" value={stats?.soDieuPhoi ?? 0} />
          <StatCard icon="fa-user" label="Khach hang" value={stats?.soKhachHang ?? 0} />
        </div>

        <div className="panel">
          <div className="filters">
            <input type="text" value={filters.keyword} onChange={(e) => setFilters({ ...filters, keyword: e.target.value })} placeholder="Tim ten dang nhap, email, so dien thoai" />
            <select value={filters.vaiTro} onChange={(e) => setFilters({ ...filters, vaiTro: e.target.value })}>
              <option value="">Tat ca vai tro</option>
              {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={filters.trangThai} onChange={(e) => setFilters({ ...filters, trangThai: e.target.value })}>
              <option value="">Tat ca trang thai</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button type="button" onClick={onFilter}><i className="fa-solid fa-filter" /> Loc</button>
            <button type="button" onClick={onRefresh}><i className="fa-solid fa-rotate-right" /> Lam moi</button>
          </div>

          {loading ? <p className="loading">Dang tai du lieu...</p> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ma tai khoan</th><th>Ten dang nhap</th><th>Email</th><th>So dien thoai</th><th>Vai tro</th><th>Trang thai</th><th>Ngay tao</th><th>Hanh dong</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.maTaiKhoan}>
                      <td>{user.maTaiKhoan}</td>
                      <td>{user.tenDangNhap}</td>
                      <td>{displayValue(user.email)}</td>
                      <td>{displayValue(user.soDienThoai)}</td>
                      <td>{user.vaiTro}</td>
                      <td>{user.trangThaiTaiKhoan}</td>
                      <td>{displayValue(user.ngayTao)}</td>
                      <td className="actions">
                        <button onClick={() => openDetail(user)}><i className="fa-solid fa-eye" /></button>
                        <button onClick={() => openEditModal(user)}><i className="fa-solid fa-pen-to-square" /></button>
                        <button onClick={() => onToggleLock(user)}><i className={`fa-solid ${user.trangThaiTaiKhoan === "Khóa" ? "fa-unlock" : "fa-lock"}`} /></button>
                        <button onClick={() => onDeactivate(user)}><i className="fa-solid fa-user-slash" /></button>
                        <button onClick={() => { setSelectedUser(user); setNewPassword(""); setResetPasswordOpen(true); }}><i className="fa-solid fa-key" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {detailOpen && selectedUser && (
        <Modal title="Chi tiet tai khoan" onClose={() => setDetailOpen(false)}>
          <Info label="Ma tai khoan" value={selectedUser.maTaiKhoan} />
          <Info label="Ten dang nhap" value={selectedUser.tenDangNhap} />
          <Info label="Email" value={displayValue(selectedUser.email)} />
          <Info label="So dien thoai" value={displayValue(selectedUser.soDienThoai)} />
          <Info label="Vai tro" value={selectedUser.vaiTro} />
          <Info label="Trang thai" value={selectedUser.trangThaiTaiKhoan} />
          <Info label="Ngay tao" value={displayValue(selectedUser.ngayTao)} />
        </Modal>
      )}

      {formOpen && (
        <Modal title={editMode ? "Cap nhat tai khoan" : "Them tai khoan"} onClose={() => setFormOpen(false)}>
          <form onSubmit={submitUserForm} className="form">
            {!editMode && <input required placeholder="Ten dang nhap" value={createForm.tenDangNhap} onChange={(e) => setCreateForm({ ...createForm, tenDangNhap: e.target.value })} />}
            {!editMode && <input required type="password" placeholder="Mat khau" value={createForm.matKhau} onChange={(e) => setCreateForm({ ...createForm, matKhau: e.target.value })} />}
            <input placeholder="Email" value={editMode ? editForm.email : createForm.email} onChange={(e) => editMode ? setEditForm({ ...editForm, email: e.target.value }) : setCreateForm({ ...createForm, email: e.target.value })} />
            <input placeholder="So dien thoai" value={editMode ? editForm.soDienThoai : createForm.soDienThoai} onChange={(e) => editMode ? setEditForm({ ...editForm, soDienThoai: e.target.value }) : setCreateForm({ ...createForm, soDienThoai: e.target.value })} />
            <select value={editMode ? editForm.vaiTro : createForm.vaiTro} onChange={(e) => editMode ? setEditForm({ ...editForm, vaiTro: e.target.value }) : setCreateForm({ ...createForm, vaiTro: e.target.value })}>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={editMode ? editForm.trangThaiTaiKhoan : createForm.trangThaiTaiKhoan} onChange={(e) => editMode ? setEditForm({ ...editForm, trangThaiTaiKhoan: e.target.value }) : setCreateForm({ ...createForm, trangThaiTaiKhoan: e.target.value })}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button disabled={submitting} type="submit" className="primary-btn">{submitting ? "Dang xu ly..." : "Xac nhan"}</button>
          </form>
        </Modal>
      )}

      {resetPasswordOpen && selectedUser && (
        <Modal title="Reset mat khau" onClose={() => setResetPasswordOpen(false)}>
          <input type="password" placeholder="Nhap mat khau moi" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <button disabled={submitting || !newPassword.trim()} onClick={submitResetPassword} type="button" className="primary-btn">{submitting ? "Dang xu ly..." : "Xac nhan reset"}</button>
        </Modal>
      )}

      {lockOpen && selectedUser && (
        <Modal title="Khoa tai khoan" onClose={() => setLockOpen(false)}>
          <textarea placeholder="Nhap ly do khoa tai khoan" value={lockReason} onChange={(e) => setLockReason(e.target.value)} />
          <button disabled={submitting} onClick={submitLock} type="button" className="primary-btn">{submitting ? "Dang xu ly..." : "Xac nhan khoa"}</button>
        </Modal>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon, label, value }) {
  return <article className="stat-card"><i className={`fa-solid ${icon}`} /><div><p>{label}</p><h3>{value}</h3></div></article>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__head"><h3>{title}</h3><button onClick={onClose} type="button"><i className="fa-solid fa-xmark" /></button></div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>;
}

export default UserManagementPage;
