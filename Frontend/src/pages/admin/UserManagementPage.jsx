import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/UserManagementPage.css";

const initialUsers = [
  {
    id: "TK01",
    username: "admin01",
    email: "admin01@airport.vn",
    phone: "0901000001",
    role: "Quản trị",
    status: "Hoạt động",
    createdAt: "2026-05-01",
  },
  {
    id: "TK02",
    username: "dieuphoi01",
    email: "dieuphoi01@airport.vn",
    phone: "0901000002",
    role: "Điều phối",
    status: "Hoạt động",
    createdAt: "2026-05-01",
  },
  {
    id: "TK03",
    username: "giamsat01",
    email: "giamsat01@airport.vn",
    phone: "0901000003",
    role: "Giám sát",
    status: "Hoạt động",
    createdAt: "2026-05-01",
  },
  {
    id: "TK04",
    username: "nhanvien01",
    email: "nhanvien01@airport.vn",
    phone: "0901000004",
    role: "Nhân viên",
    status: "Khóa",
    createdAt: "2026-05-02",
  },
  {
    id: "TK05",
    username: "nhanvien02",
    email: "nhanvien02@airport.vn",
    phone: "0901000005",
    role: "Nhân viên",
    status: "Ngừng sử dụng",
    createdAt: "2026-05-02",
  },
];

const emptyForm = {
  username: "",
  email: "",
  phone: "",
  role: "Nhân viên",
  status: "Hoạt động",
};

function UserManagementPage({ onNavigate }) {
  const [users, setUsers] = useState(initialUsers);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [formData, setFormData] = useState(emptyForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = searchKeyword.trim().toLowerCase();

      const matchesKeyword =
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.includes(keyword);

      const matchesRole = roleFilter === "Tất cả" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "Tất cả" || user.status === statusFilter;

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [users, searchKeyword, roleFilter, statusFilter]);

  const accountStats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === "Hoạt động").length,
      locked: users.filter((user) => user.status === "Khóa").length,
      inactive: users.filter((user) => user.status === "Ngừng sử dụng").length,
    };
  }, [users]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.username.trim() || !formData.email.trim()) {
      alert("Vui lòng nhập tên đăng nhập và email.");
      return;
    }

    if (editingUserId) {
      const updatedUsers = users.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              ...formData,
            }
          : user,
      );

      setUsers(updatedUsers);
      setSelectedUser(updatedUsers.find((user) => user.id === editingUserId));
      setEditingUserId(null);
      setFormData(emptyForm);
      return;
    }

    const newUser = {
      id: `TK${String(users.length + 1).padStart(2, "0")}`,
      ...formData,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers([newUser, ...users]);
    setSelectedUser(newUser);
    setFormData(emptyForm);
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFormData(emptyForm);
  };

  const handleChangeStatus = (userId, newStatus) => {
    const updatedUsers = users.map((user) =>
      user.id === userId
        ? {
            ...user,
            status: newStatus,
          }
        : user,
    );

    setUsers(updatedUsers);

    if (selectedUser?.id === userId) {
      setSelectedUser(updatedUsers.find((user) => user.id === userId));
    }
  };

  const handleResetPassword = (user) => {
    alert(`Đã tạo yêu cầu đặt lại mật khẩu cho tài khoản ${user.username}.`);
  };

  const getStatusClassName = (status) => {
    if (status === "Hoạt động") {
      return "user-table__status user-table__status--active";
    }

    if (status === "Khóa") {
      return "user-table__status user-table__status--locked";
    }

    return "user-table__status user-table__status--inactive";
  };

  const getRoleClassName = (role) => {
    if (role === "Quản trị") {
      return "user-table__role user-table__role--admin";
    }

    if (role === "Điều phối") {
      return "user-table__role user-table__role--operator";
    }

    if (role === "Giám sát") {
      return "user-table__role user-table__role--supervisor";
    }

    return "user-table__role user-table__role--staff";
  };

  return (
    <AdminLayout activePage="users" onNavigate={onNavigate}>
      <section className="user-page">
        <div className="user-page__heading">
          <div>
            <p className="user-page__eyebrow">User Management</p>
            <h1 className="user-page__title">Người dùng & phân quyền</h1>
            <p className="user-page__description">
              Quản lý tài khoản nội bộ, vai trò và trạng thái truy cập của nhân
              sự vận hành hệ thống FIDS.
            </p>
          </div>

          <div className="user-page__heading-icon">👤</div>
        </div>

        <div className="user-page__stats-grid">
          <article className="user-stat-card">
            <span className="user-stat-card__icon">👥</span>
            <div>
              <p className="user-stat-card__label">Tổng tài khoản</p>
              <h2 className="user-stat-card__value">{accountStats.total}</h2>
            </div>
          </article>

          <article className="user-stat-card">
            <span className="user-stat-card__icon">✅</span>
            <div>
              <p className="user-stat-card__label">Đang hoạt động</p>
              <h2 className="user-stat-card__value">{accountStats.active}</h2>
            </div>
          </article>

          <article className="user-stat-card">
            <span className="user-stat-card__icon">🔒</span>
            <div>
              <p className="user-stat-card__label">Bị khóa</p>
              <h2 className="user-stat-card__value">{accountStats.locked}</h2>
            </div>
          </article>

          <article className="user-stat-card">
            <span className="user-stat-card__icon">⛔</span>
            <div>
              <p className="user-stat-card__label">Ngừng sử dụng</p>
              <h2 className="user-stat-card__value">{accountStats.inactive}</h2>
            </div>
          </article>
        </div>

        <div className="user-page__main-stack">
          <section className="user-panel user-panel--form">
            <div className="user-panel__header">
              <div>
                <h2 className="user-panel__title">
                  {editingUserId ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
                </h2>
                <p className="user-panel__subtitle">
                  Tạo hoặc chỉnh sửa tài khoản nội bộ cho hệ thống.
                </p>
              </div>
            </div>

            <form className="user-form" onSubmit={handleSubmit}>
              <input
                className="user-form__input"
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Tên đăng nhập"
              />

              <input
                className="user-form__input"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />

              <input
                className="user-form__input"
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
              />

              <select
                className="user-form__input"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Quản trị">Quản trị</option>
                <option value="Điều phối">Điều phối</option>
                <option value="Giám sát">Giám sát</option>
                <option value="Nhân viên">Nhân viên</option>
              </select>

              <select
                className="user-form__input"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Hoạt động">Hoạt động</option>
                <option value="Khóa">Khóa</option>
                <option value="Ngừng sử dụng">Ngừng sử dụng</option>
              </select>

              <div className="user-form__actions">
                <button className="user-form__submit-button" type="submit">
                  {editingUserId ? "Lưu cập nhật" : "Thêm tài khoản"}
                </button>

                {editingUserId && (
                  <button
                    className="user-form__cancel-button"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="user-panel user-panel--table">
            <div className="user-panel__header">
              <div>
                <h2 className="user-panel__title">Danh sách tài khoản</h2>
                <p className="user-panel__subtitle">
                  Dữ liệu mô phỏng theo bảng TAIKHOAN trong SQL Server.
                </p>
              </div>
            </div>

            <div className="user-toolbar">
              <input
                className="user-toolbar__search"
                type="text"
                placeholder="Tìm theo tên đăng nhập, email, số điện thoại..."
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
              />

              <select
                className="user-toolbar__select"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả vai trò</option>
                <option value="Quản trị">Quản trị</option>
                <option value="Điều phối">Điều phối</option>
                <option value="Giám sát">Giám sát</option>
                <option value="Nhân viên">Nhân viên</option>
              </select>

              <select
                className="user-toolbar__select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Khóa">Khóa</option>
                <option value="Ngừng sử dụng">Ngừng sử dụng</option>
              </select>
            </div>

            <div className="user-table-wrapper">
              <div className="user-table">
                <div className="user-table__header">
                  <span>Mã TK</span>
                  <span>Tên đăng nhập</span>
                  <span>Email</span>
                  <span>Vai trò</span>
                  <span>Trạng thái</span>
                  <span>Thao tác</span>
                </div>

                {filteredUsers.map((user) => (
                  <div className="user-table__row" key={user.id}>
                    <span className="user-table__id">{user.id}</span>

                    <button
                      className="user-table__username"
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailOpen(true);
                      }}
                    >
                      {user.username}
                    </button>

                    <span className="user-table__text">{user.email}</span>

                    <span className={getRoleClassName(user.role)}>
                      {user.role}
                    </span>

                    <span className={getStatusClassName(user.status)}>
                      {user.status}
                    </span>

                    <div className="user-table__actions">
                      <button
                        className="user-table__action-button"
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailOpen(true);
                        }}
                      >
                        Xem
                      </button>

                      <button
                        className="user-table__action-button"
                        type="button"
                        onClick={() => handleEditUser(user)}
                      >
                        Sửa
                      </button>

                      <button
                        className="user-table__action-button"
                        type="button"
                        onClick={() => handleResetPassword(user)}
                      >
                        Reset
                      </button>

                      <button
                        className="user-table__action-button user-table__action-button--warning"
                        type="button"
                        onClick={() => handleChangeStatus(user.id, "Khóa")}
                      >
                        Khóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {isDetailOpen && selectedUser && (
            <div className="user-modal">
              <div
                className="user-modal__overlay"
                onClick={() => setIsDetailOpen(false)}
              ></div>
              <div className="user-modal__content">
                <div className="user-modal__header">
                  <h3 className="user-modal__title">Chi tiết tài khoản</h3>
                  <button
                    className="user-modal__close-button"
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="user-modal__body">
                  <div className="user-modal__avatar">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="user-modal__info-grid">
                    <div className="user-modal__item">
                      <span>Mã tài khoản</span>
                      <strong>{selectedUser.id}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Tên đăng nhập</span>
                      <strong>{selectedUser.username}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Email</span>
                      <strong>{selectedUser.email}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Số điện thoại</span>
                      <strong>{selectedUser.phone}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Vai trò</span>
                      <strong>{selectedUser.role}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Trạng thái</span>
                      <strong>{selectedUser.status}</strong>
                    </div>
                    <div className="user-modal__item">
                      <span>Ngày tạo</span>
                      <strong>{selectedUser.createdAt}</strong>
                    </div>
                  </div>

                  <div className="user-modal__actions">
                    <button
                      className="user-detail__button"
                      type="button"
                      onClick={() => {
                        handleEditUser(selectedUser);
                        setIsDetailOpen(false);
                      }}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="user-detail__button user-detail__button--danger"
                      type="button"
                      onClick={() => {
                        handleChangeStatus(selectedUser.id, "Ngừng sử dụng");
                        setIsDetailOpen(false);
                      }}
                    >
                      Ngừng sử dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default UserManagementPage;
