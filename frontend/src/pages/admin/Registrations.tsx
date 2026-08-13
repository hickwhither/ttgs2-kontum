import { useEffect, useState } from "react";
import {
  searchRegistrations,
  patchRegistration,
  deleteRegistration,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  SESSION_LABELS,
  formatDate,
  Registration,
  Status,
} from "../../api.js";

export default function Registrations() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | "">("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params: {
        status?: Status;
        relative_id_number?: string;
        relative_full_name?: string;
        limit: number;
      } = { limit: 200 };
      if (statusFilter) params.status = statusFilter;
      const term = keyword.trim();
      if (term) {
        if (/^\d+$/.test(term)) {
          params.relative_id_number = term;
        } else {
          params.relative_full_name = term;
        }
      }
      const list = await searchRegistrations(params);
      setRows(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function onStatusChange(registration: Registration, newStatus: Status) {
    setError("");
    setMessage("");
    try {
      const updated = await patchRegistration(registration.id, { status: newStatus });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (newStatus === "confirmed" && updated.call_number) {
        setMessage(`Hồ sơ #${updated.id} đã xác nhận, số gọi #${updated.call_number}.`);
      } else {
        setMessage(`Đã cập nhật trạng thái hồ sơ #${updated.id}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function onDelete(registration: Registration) {
    if (!window.confirm(`Xóa hồ sơ #${registration.id} (${registration.relative_full_name})?`)) {
      return;
    }
    setError("");
    setMessage("");
    try {
      await deleteRegistration(registration.id);
      setRows((prev) => prev.filter((r) => r.id !== registration.id));
      setMessage(`Đã xóa hồ sơ #${registration.id}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <h1 className="title is-5">Hồ sơ đăng ký thăm gặp</h1>

      <div className="field is-grouped mb-4">
        <div className="control is-expanded">
          <input
            className="input"
            type="text"
            placeholder="Tìm theo số CCCD/CMND hoặc họ tên…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
          />
        </div>
        <div className="control">
          <button className="button is-link" onClick={() => void load()}>Tìm</button>
        </div>
        <div className="control">
          <div className="select">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "")}>
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {message && <div className="notification is-success is-light">{message}</div>}
      {error && <div className="notification is-danger is-light">{error}</div>}

      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable is-narrow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người đăng ký</th>
              <th>CCCD/CMND</th>
              <th>Phạm nhân</th>
              <th>Ngày thăm gặp</th>
              <th>Buổi</th>
              <th>Số gọi</th>
              <th>Trạng thái</th>
              <th>Đổi trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  {r.relative_full_name}
                  <br />
                  <span className="is-size-7 has-text-grey">{r.relative_relationship}</span>
                </td>
                <td>{r.relative_id_number}</td>
                <td>{r.prisoner_full_name}</td>
                <td>{formatDate(r.visit_date)}</td>
                <td>{SESSION_LABELS[r.visit_session]}</td>
                <td>{r.call_number ? `#${r.call_number}` : "—"}</td>
                <td>
                  <span className={`tag ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td>
                  <div className="select is-small">
                    <select
                      value={r.status}
                      onChange={(e) => void onStatusChange(r, e.target.value as Status)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <button className="button is-small is-danger is-light" onClick={() => void onDelete(r)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && rows.length === 0 && (
        <p className="has-text-grey">Không có hồ sơ nào.</p>
      )}
      {loading && <p className="has-text-grey">Đang tải…</p>}
    </div>
  );
}
