import { useState } from "react";
import type { FormEvent } from "react";
import {
  searchRegistrations,
  STATUS_LABELS,
  STATUS_COLORS,
  SESSION_LABELS,
  formatDate,
  Registration,
} from "../api.js";

export default function Lookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setError("");
    setResults(null);
    setSearching(true);
    try {
      const list = await searchRegistrations({
        relative_id_number: /^\d+$/.test(term) ? term : undefined,
        relative_full_name: /^\d+$/.test(term) ? undefined : term,
        limit: 50,
      });
      setResults(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <h1 className="title is-4">Tra cứu hồ sơ đăng ký</h1>
      <p className="subtitle is-6 has-text-grey">
        Nhập số CCCD/CMND hoặc họ tên người đăng ký để xem trạng thái và số gọi.
      </p>

      <form onSubmit={onSubmit} className="field has-addons">
        <div className="control is-expanded">
          <input
            className="input"
            type="text"
            placeholder="Số CCCD/CMND hoặc họ tên…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <div className="control">
          <button className={`button is-link ${searching ? "is-loading" : ""}`} disabled={searching}>
            Tra cứu
          </button>
        </div>
      </form>

      {error && <div className="notification is-danger is-light mt-4">{error}</div>}

      {results !== null && results.length === 0 && (
        <div className="notification is-warning is-light mt-4">
          Không tìm thấy hồ sơ nào khớp với thông tin đã nhập.
        </div>
      )}

      {results !== null && results.length > 0 && (
        <div className="table-container mt-4">
          <table className="table is-fullwidth is-striped is-hoverable">
            <thead>
              <tr>
                <th>Mã hồ sơ</th>
                <th>Người đăng ký</th>
                <th>Phạm nhân</th>
                <th>Ngày thăm gặp</th>
                <th>Buổi</th>
                <th>Số gọi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.relative_full_name}</td>
                  <td>{r.prisoner_full_name}</td>
                  <td>{formatDate(r.visit_date)}</td>
                  <td>{SESSION_LABELS[r.visit_session]}</td>
                  <td>{r.call_number ? `#${r.call_number}` : "—"}</td>
                  <td>
                    <span className={`tag ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
