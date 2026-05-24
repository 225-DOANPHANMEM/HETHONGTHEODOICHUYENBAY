import { useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import "../../styles/admin/OperatingCatalogPage.css";

const STATUS_OPTIONS = ["Sẵn sàng", "Đang dùng", "Bảo trì", "Đóng"];
const TERMINAL_TYPES = ["Nội địa", "Quốc tế", "Hỗn hợp"];

const TAB_CONFIG = [
  { key: "airlines", label: "Hãng hàng không", icon: "🛩️" },
  { key: "terminals", label: "Nhà ga", icon: "🏢" },
  { key: "gates", label: "Cổng ra", icon: "🚪" },
  { key: "belts", label: "Băng chuyền", icon: "🧳" },
];

const initialAirlines = [
  { id: "HHK01", code: "VN", name: "Vietnam Airlines", country: "Việt Nam" },
  { id: "HHK02", code: "VJ", name: "Vietjet Air", country: "Việt Nam" },
  { id: "HHK03", code: "QH", name: "Bamboo Airways", country: "Việt Nam" },
  { id: "HHK04", code: "SQ", name: "Singapore Airlines", country: "Singapore" },
  { id: "HHK05", code: "KE", name: "Korean Air", country: "Hàn Quốc" },
];

const initialTerminals = [
  {
    id: "NG01",
    name: "Nhà ga T1",
    type: "Nội địa",
    description: "Nhà ga phục vụ các chuyến bay nội địa",
  },
  {
    id: "NG02",
    name: "Nhà ga T2",
    type: "Quốc tế",
    description: "Nhà ga phục vụ các chuyến bay quốc tế",
  },
  {
    id: "NG03",
    name: "Nhà ga hỗn hợp A",
    type: "Hỗn hợp",
    description: "Khu vực khai thác hỗn hợp",
  },
  {
    id: "NG04",
    name: "Nhà ga mở rộng",
    type: "Nội địa",
    description: "Khu vực mở rộng nội địa",
  },
  {
    id: "NG05",
    name: "Nhà ga dự phòng",
    type: "Hỗn hợp",
    description: "Khu vực dự phòng khi quá tải",
  },
];

const initialGates = [
  { id: "G01", terminalId: "NG01", name: "Cổng 1", status: "Sẵn sàng" },
  { id: "G02", terminalId: "NG01", name: "Cổng 2", status: "Sẵn sàng" },
  { id: "G03", terminalId: "NG02", name: "Cổng 3", status: "Sẵn sàng" },
  { id: "G04", terminalId: "NG02", name: "Cổng 4", status: "Sẵn sàng" },
  { id: "G05", terminalId: "NG03", name: "Cổng 5", status: "Sẵn sàng" },
];

const initialBelts = [
  {
    id: "BC01",
    terminalId: "NG01",
    name: "Băng chuyền 1",
    status: "Sẵn sàng",
  },
  {
    id: "BC02",
    terminalId: "NG01",
    name: "Băng chuyền 2",
    status: "Sẵn sàng",
  },
  {
    id: "BC03",
    terminalId: "NG02",
    name: "Băng chuyền 3",
    status: "Sẵn sàng",
  },
  {
    id: "BC04",
    terminalId: "NG02",
    name: "Băng chuyền 4",
    status: "Sẵn sàng",
  },
  {
    id: "BC05",
    terminalId: "NG03",
    name: "Băng chuyền 5",
    status: "Sẵn sàng",
  },
];

const emptyForms = {
  airlines: { code: "", name: "", country: "" },
  terminals: { name: "", type: "Nội địa", description: "" },
  gates: { terminalId: "NG01", name: "", status: "Sẵn sàng" },
  belts: { terminalId: "NG01", name: "", status: "Sẵn sàng" },
};

function OperatingCatalogPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("airlines");
  const [airlines, setAirlines] = useState(initialAirlines);
  const [terminals, setTerminals] = useState(initialTerminals);
  const [gates, setGates] = useState(initialGates);
  const [belts, setBelts] = useState(initialBelts);
  const [keyword, setKeyword] = useState("");
  const [terminalFilter, setTerminalFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [formData, setFormData] = useState(emptyForms.airlines);
  const [editingId, setEditingId] = useState(null);

  const terminalNameById = useMemo(() => {
    return terminals.reduce((map, terminal) => {
      map[terminal.id] = terminal.name;
      return map;
    }, {});
  }, [terminals]);

  const catalogStats = useMemo(() => {
    const resources = [...gates, ...belts];

    return {
      airlines: airlines.length,
      terminals: terminals.length,
      ready: resources.filter((item) => item.status === "Sẵn sàng").length,
      maintenance: resources.filter((item) => item.status === "Bảo trì").length,
    };
  }, [airlines, terminals, gates, belts]);

  const filteredData = useMemo(() => {
    const searchValue = keyword.trim().toLowerCase();

    if (activeTab === "airlines") {
      return airlines.filter((airline) => {
        return (
          airline.id.toLowerCase().includes(searchValue) ||
          airline.code.toLowerCase().includes(searchValue) ||
          airline.name.toLowerCase().includes(searchValue) ||
          airline.country.toLowerCase().includes(searchValue)
        );
      });
    }

    if (activeTab === "terminals") {
      return terminals.filter((terminal) => {
        return (
          terminal.id.toLowerCase().includes(searchValue) ||
          terminal.name.toLowerCase().includes(searchValue) ||
          terminal.type.toLowerCase().includes(searchValue)
        );
      });
    }

    const resources = activeTab === "gates" ? gates : belts;

    return resources.filter((resource) => {
      const matchesKeyword =
        resource.id.toLowerCase().includes(searchValue) ||
        resource.name.toLowerCase().includes(searchValue) ||
        terminalNameById[resource.terminalId]
          ?.toLowerCase()
          .includes(searchValue);

      const matchesTerminal =
        terminalFilter === "Tất cả" || resource.terminalId === terminalFilter;

      const matchesStatus =
        statusFilter === "Tất cả" || resource.status === statusFilter;

      return matchesKeyword && matchesTerminal && matchesStatus;
    });
  }, [
    activeTab,
    airlines,
    terminals,
    gates,
    belts,
    keyword,
    terminalFilter,
    statusFilter,
    terminalNameById,
  ]);

  const handleChangeTab = (tabKey) => {
    setActiveTab(tabKey);
    setKeyword("");
    setTerminalFilter("Tất cả");
    setStatusFilter("Tất cả");
    setEditingId(null);
    setFormData(emptyForms[tabKey]);
  };

  const handleChangeForm = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const generateId = (prefix, currentItems) => {
    const maxNumber = currentItems.reduce((max, item) => {
      const numberValue = Number(item.id.replace(prefix, ""));
      return Number.isNaN(numberValue) ? max : Math.max(max, numberValue);
    }, 0);

    return `${prefix}${String(maxNumber + 1).padStart(2, "0")}`;
  };

  const isDuplicate = (items, field, value) => {
    return items.some((item) => {
      return (
        item.id !== editingId &&
        item[field].trim().toLowerCase() === value.trim().toLowerCase()
      );
    });
  };

  const validateForm = () => {
    if (activeTab === "airlines") {
      if (
        !formData.code.trim() ||
        !formData.name.trim() ||
        !formData.country.trim()
      ) {
        alert("Vui lòng nhập đủ mã hãng, tên hãng và quốc gia.");
        return false;
      }

      if (isDuplicate(airlines, "code", formData.code)) {
        alert("Mã hãng đã tồn tại. Vui lòng nhập mã hãng khác.");
        return false;
      }

      return true;
    }

    if (activeTab === "terminals") {
      if (!formData.name.trim()) {
        alert("Vui lòng nhập tên nhà ga.");
        return false;
      }

      return true;
    }

    if (activeTab === "gates") {
      if (!formData.name.trim() || !formData.terminalId) {
        alert("Vui lòng nhập tên cổng và chọn nhà ga.");
        return false;
      }

      if (isDuplicate(gates, "name", formData.name)) {
        alert("Tên cổng đã tồn tại. Vui lòng nhập tên cổng khác.");
        return false;
      }

      return true;
    }

    if (!formData.name.trim() || !formData.terminalId) {
      alert("Vui lòng nhập tên băng chuyền và chọn nhà ga.");
      return false;
    }

    if (isDuplicate(belts, "name", formData.name)) {
      alert("Tên băng chuyền đã tồn tại. Vui lòng nhập tên băng chuyền khác.");
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (activeTab === "airlines") {
      const nextAirline = {
        id: editingId || generateId("HHK", airlines),
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        country: formData.country.trim(),
      };

      setAirlines(
        editingId
          ? airlines.map((item) => (item.id === editingId ? nextAirline : item))
          : [nextAirline, ...airlines],
      );
    }

    if (activeTab === "terminals") {
      const nextTerminal = {
        id: editingId || generateId("NG", terminals),
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
      };

      setTerminals(
        editingId
          ? terminals.map((item) =>
              item.id === editingId ? nextTerminal : item,
            )
          : [nextTerminal, ...terminals],
      );
    }

    if (activeTab === "gates") {
      const nextGate = {
        id: editingId || generateId("G", gates),
        terminalId: formData.terminalId,
        name: formData.name.trim(),
        status: formData.status,
      };

      setGates(
        editingId
          ? gates.map((item) => (item.id === editingId ? nextGate : item))
          : [nextGate, ...gates],
      );
    }

    if (activeTab === "belts") {
      const nextBelt = {
        id: editingId || generateId("BC", belts),
        terminalId: formData.terminalId,
        name: formData.name.trim(),
        status: formData.status,
      };

      setBelts(
        editingId
          ? belts.map((item) => (item.id === editingId ? nextBelt : item))
          : [nextBelt, ...belts],
      );
    }

    setEditingId(null);
    setFormData(emptyForms[activeTab]);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);

    if (activeTab === "airlines") {
      setFormData({
        code: item.code,
        name: item.name,
        country: item.country,
      });
      return;
    }

    if (activeTab === "terminals") {
      setFormData({
        name: item.name,
        type: item.type,
        description: item.description,
      });
      return;
    }

    setFormData({
      terminalId: item.terminalId,
      name: item.name,
      status: item.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(emptyForms[activeTab]);
  };

  const handleChangeResourceStatus = (resourceId, newStatus) => {
    if (activeTab === "gates") {
      setGates(
        gates.map((gate) =>
          gate.id === resourceId ? { ...gate, status: newStatus } : gate,
        ),
      );
      return;
    }

    setBelts(
      belts.map((belt) =>
        belt.id === resourceId ? { ...belt, status: newStatus } : belt,
      ),
    );
  };

  const getStatusClassName = (status) => {
    const statusClassMap = {
      "Sẵn sàng": "catalog-status catalog-status--ready",
      "Đang dùng": "catalog-status catalog-status--using",
      "Bảo trì": "catalog-status catalog-status--maintenance",
      Đóng: "catalog-status catalog-status--closed",
    };

    return statusClassMap[status] || "catalog-status";
  };

  const currentTab = TAB_CONFIG.find((tab) => tab.key === activeTab);

  return (
    <AdminLayout activePage="catalog" onNavigate={onNavigate}>
      <section className="catalog-page">
        <div className="catalog-page__heading">
          <div>
            <p className="catalog-page__eyebrow">Operating Catalog</p>
            <h1 className="catalog-page__title">Danh mục vận hành</h1>
            <p className="catalog-page__description">
              Quản lý dữ liệu nền phục vụ cập nhật tình hình chuyến bay đến và
              đi tại sân bay quốc tế Đà Nẵng.
            </p>
          </div>

          <div className="catalog-page__heading-icon">🗂</div>
        </div>

        <div className="catalog-page__stats-grid">
          <article className="catalog-stat-card">
            <span className="catalog-stat-card__icon">🛩️</span>
            <div>
              <p className="catalog-stat-card__label">Hãng hàng không</p>
              <h2 className="catalog-stat-card__value">
                {catalogStats.airlines}
              </h2>
            </div>
          </article>

          <article className="catalog-stat-card">
            <span className="catalog-stat-card__icon">🏢</span>
            <div>
              <p className="catalog-stat-card__label">Nhà ga</p>
              <h2 className="catalog-stat-card__value">
                {catalogStats.terminals}
              </h2>
            </div>
          </article>

          <article className="catalog-stat-card">
            <span className="catalog-stat-card__icon">✅</span>
            <div>
              <p className="catalog-stat-card__label">Tài nguyên sẵn sàng</p>
              <h2 className="catalog-stat-card__value">{catalogStats.ready}</h2>
            </div>
          </article>

          <article className="catalog-stat-card">
            <span className="catalog-stat-card__icon">🛠️</span>
            <div>
              <p className="catalog-stat-card__label">Đang bảo trì</p>
              <h2 className="catalog-stat-card__value">
                {catalogStats.maintenance}
              </h2>
            </div>
          </article>
        </div>

        <div className="catalog-tabs">
          {TAB_CONFIG.map((tab) => (
            <button
              className={
                activeTab === tab.key
                  ? "catalog-tabs__button catalog-tabs__button--active"
                  : "catalog-tabs__button"
              }
              key={tab.key}
              type="button"
              onClick={() => handleChangeTab(tab.key)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="catalog-page__main-stack">
          <section className="catalog-panel catalog-panel--form">
            <div className="catalog-panel__header">
              <div>
                <h2 className="catalog-panel__title">
                  {editingId
                    ? `Cập nhật ${currentTab.label.toLowerCase()}`
                    : `Thêm ${currentTab.label.toLowerCase()}`}
                </h2>
                <p className="catalog-panel__subtitle">
                  Dữ liệu đang mô phỏng theo các bảng HANGHANGKHONG, NHAGA, CONG
                  và BANGCHUYENHANHLY.
                </p>
              </div>
            </div>

            <form
              className={`catalog-form catalog-form--${activeTab}`}
              onSubmit={handleSubmit}
            >
              {activeTab === "airlines" && (
                <>
                  <input
                    className="catalog-form__input"
                    name="code"
                    value={formData.code}
                    onChange={handleChangeForm}
                    placeholder="Mã hãng: VN, VJ, QH..."
                  />

                  <input
                    className="catalog-form__input"
                    name="name"
                    value={formData.name}
                    onChange={handleChangeForm}
                    placeholder="Tên hãng hàng không"
                  />

                  <input
                    className="catalog-form__input"
                    name="country"
                    value={formData.country}
                    onChange={handleChangeForm}
                    placeholder="Quốc gia"
                  />
                </>
              )}

              {activeTab === "terminals" && (
                <>
                  <input
                    className="catalog-form__input"
                    name="name"
                    value={formData.name}
                    onChange={handleChangeForm}
                    placeholder="Tên nhà ga"
                  />

                  <select
                    className="catalog-form__input"
                    name="type"
                    value={formData.type}
                    onChange={handleChangeForm}
                  >
                    {TERMINAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <input
                    className="catalog-form__input"
                    name="description"
                    value={formData.description}
                    onChange={handleChangeForm}
                    placeholder="Mô tả ngắn"
                  />
                </>
              )}

              {(activeTab === "gates" || activeTab === "belts") && (
                <>
                  <select
                    className="catalog-form__input"
                    name="terminalId"
                    value={formData.terminalId}
                    onChange={handleChangeForm}
                  >
                    {terminals.map((terminal) => (
                      <option key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </option>
                    ))}
                  </select>

                  <input
                    className="catalog-form__input"
                    name="name"
                    value={formData.name}
                    onChange={handleChangeForm}
                    placeholder={
                      activeTab === "gates" ? "Tên cổng ra" : "Tên băng chuyền"
                    }
                  />

                  <select
                    className="catalog-form__input"
                    name="status"
                    value={formData.status}
                    onChange={handleChangeForm}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div className="catalog-form__actions">
                <button className="catalog-form__submit-button" type="submit">
                  {editingId ? "Lưu cập nhật" : "Thêm mới"}
                </button>

                {editingId && (
                  <button
                    className="catalog-form__cancel-button"
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="catalog-panel catalog-panel--table">
            <div className="catalog-panel__header catalog-panel__header--split">
              <div>
                <h2 className="catalog-panel__title">
                  Danh sách {currentTab.label.toLowerCase()}
                </h2>
                <p className="catalog-panel__subtitle">
                  Tìm kiếm, lọc theo nhà ga và cập nhật trạng thái tài nguyên
                  khi cần điều phối.
                </p>
              </div>

              <span className="catalog-panel__count">
                {filteredData.length} bản ghi
              </span>
            </div>

            <div className="catalog-toolbar">
              <input
                className="catalog-toolbar__search"
                type="text"
                placeholder="Tìm theo mã, tên, nhà ga..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />

              {(activeTab === "gates" || activeTab === "belts") && (
                <>
                  <select
                    className="catalog-toolbar__select"
                    value={terminalFilter}
                    onChange={(event) => setTerminalFilter(event.target.value)}
                  >
                    <option value="Tất cả">Tất cả nhà ga</option>
                    {terminals.map((terminal) => (
                      <option key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="catalog-toolbar__select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="Tất cả">Tất cả trạng thái</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="catalog-table-wrapper">
              {activeTab === "airlines" && (
                <div className="catalog-table catalog-table--airlines">
                  <div className="catalog-table__header">
                    <span>Mã HHK</span>
                    <span>Mã hãng</span>
                    <span>Tên hãng hàng không</span>
                    <span>Quốc gia</span>
                    <span>Thao tác</span>
                  </div>

                  {filteredData.map((airline) => (
                    <div className="catalog-table__row" key={airline.id}>
                      <span className="catalog-table__id">{airline.id}</span>
                      <span className="catalog-table__code">
                        {airline.code}
                      </span>
                      <span className="catalog-table__text catalog-table__text--strong">
                        {airline.name}
                      </span>
                      <span className="catalog-table__text">
                        {airline.country}
                      </span>
                      <div className="catalog-table__actions">
                        <button
                          className="catalog-table__action-button"
                          type="button"
                          onClick={() => handleEdit(airline)}
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "terminals" && (
                <div className="catalog-table catalog-table--terminals">
                  <div className="catalog-table__header">
                    <span>Mã nhà ga</span>
                    <span>Tên nhà ga</span>
                    <span>Loại</span>
                    <span>Mô tả</span>
                    <span>Thao tác</span>
                  </div>

                  {filteredData.map((terminal) => (
                    <div className="catalog-table__row" key={terminal.id}>
                      <span className="catalog-table__id">{terminal.id}</span>
                      <span className="catalog-table__text catalog-table__text--strong">
                        {terminal.name}
                      </span>
                      <span className="catalog-badge catalog-badge--terminal">
                        {terminal.type}
                      </span>
                      <span className="catalog-table__text">
                        {terminal.description || "Chưa có mô tả"}
                      </span>
                      <div className="catalog-table__actions">
                        <button
                          className="catalog-table__action-button"
                          type="button"
                          onClick={() => handleEdit(terminal)}
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(activeTab === "gates" || activeTab === "belts") && (
                <div className="catalog-table catalog-table--resources">
                  <div className="catalog-table__header">
                    <span>Mã</span>
                    <span>Tên tài nguyên</span>
                    <span>Nhà ga</span>
                    <span>Trạng thái</span>
                    <span>Cập nhật nhanh</span>
                    <span>Thao tác</span>
                  </div>

                  {filteredData.map((resource) => (
                    <div className="catalog-table__row" key={resource.id}>
                      <span className="catalog-table__id">{resource.id}</span>
                      <span className="catalog-table__text catalog-table__text--strong">
                        {resource.name}
                      </span>
                      <span className="catalog-table__text">
                        {terminalNameById[resource.terminalId]}
                      </span>
                      <span className={getStatusClassName(resource.status)}>
                        {resource.status}
                      </span>

                      <select
                        className="catalog-table__status-select"
                        value={resource.status}
                        onChange={(event) =>
                          handleChangeResourceStatus(
                            resource.id,
                            event.target.value,
                          )
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <div className="catalog-table__actions">
                        <button
                          className="catalog-table__action-button"
                          type="button"
                          onClick={() => handleEdit(resource)}
                        >
                          Sửa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredData.length === 0 && (
                <div className="catalog-empty-state">
                  <span>🔎</span>
                  <p>Không tìm thấy dữ liệu phù hợp với bộ lọc hiện tại.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </AdminLayout>
  );
}

export default OperatingCatalogPage;
