import { useMemo, useState } from "react";
import { getStatusLabel, loadStaffHistory } from "../../data/staffData.js";
import "../../styles/staff/StaffPages.css";

function StaffHistoryPage() {
  const [keyword, setKeyword] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const history = loadStaffHistory();

  const filteredHistory = useMemo(() => {
    return history.filter((item) => !keyword || item.flightNo.toLowerCase().includes(keyword.toLowerCase()) || item.action.toLowerCase().includes(keyword.toLowerCase()));
  }, [history, keyword]);

  return (
    <div className="staff-page">
      <div className="staff-page__topbar">
        <div>
          <p className="staff-page__eyebrow">Update History</p>
          <h1 className="staff-page__title">Lịch sử cập nhật chuyến bay</h1>
          <p className="staff-page__desc">Theo dõi các lần cập nhật trạng thái chuyến bay và log gửi thông báo.</p>
        </div>
      </div>

      <section className="staff-card" style={{ marginBottom: 18 }}>
        <div className="staff-card__body staff-form-grid" style={{ gridTemplateColumns: "1fr auto" }}>
          <div className="staff-form-group">
            <label>Tìm theo số hiệu / thao tác</label>
            <input className="staff-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="VD: VN132, cập nhật trạng thái..." />
          </div>
          <div style={{ alignSelf: "end", color: "#64748b", fontWeight: 800 }}>{filteredHistory.length} bản ghi</div>
        </div>
      </section>

      <section className="staff-card">
        <div className="staff-card__body">
          <div className="staff-table-wrapper">
            <table className="staff-table">
              <thead><tr><th>Thời gian</th><th>Chuyến bay</th><th>Thao tác</th><th>Trạng thái</th><th>Người cập nhật</th><th>Chi tiết</th></tr></thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: "center", padding: 42, color: "#64748b" }}>Chưa có lịch sử cập nhật. Hãy cập nhật một chuyến bay để tạo log.</td></tr>
                ) : filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.createdAt}</td>
                    <td><strong>{item.flightNo}</strong></td>
                    <td>{item.action}</td>
                    <td>{getStatusLabel(item.oldStatus)} → {getStatusLabel(item.newStatus)}</td>
                    <td>{item.employee}</td>
                    <td><button className="staff-btn staff-btn--secondary" onClick={() => setSelectedItem(item)}>Xem</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="staff-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="staff-modal" onClick={(event) => event.stopPropagation()}>
            <div className="staff-modal__header">
              <h3 style={{ margin: 0 }}>Chi tiết lịch sử cập nhật</h3>
              <button className="staff-btn staff-btn--secondary" onClick={() => setSelectedItem(null)}>Đóng</button>
            </div>
            <div className="staff-card__body">
              <div className="staff-info-list">
                <div className="staff-info-row"><span>Thời gian</span><span>{selectedItem.createdAt}</span></div>
                <div className="staff-info-row"><span>Chuyến bay</span><span>{selectedItem.flightNo}</span></div>
                <div className="staff-info-row"><span>Hãng bay</span><span>{selectedItem.airline}</span></div>
                <div className="staff-info-row"><span>Thao tác</span><span>{selectedItem.action}</span></div>
                <div className="staff-info-row"><span>Người cập nhật</span><span>{selectedItem.employee}</span></div>
              </div>
              <div className="staff-alert" style={{ marginTop: 16 }}>{selectedItem.content}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffHistoryPage;
