import React, { useState } from "react";
import { Page, Header, Box, Input, Text } from "zmp-ui";
import { searchRegistrations, Registration } from "../api";
import { formatDate } from "../utils/date";
import StatusTag from "../components/StatusTag";

const SESSION_LABELS: Record<string, string> = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
};

const LookupPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Registration[] | null>(null);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function onSubmit() {
    const term = query.trim();
    if (!term) return;
    setError("");
    setResults(null);
    setSearching(true);
    try {
      const isId = /^\d+$/.test(term);
      const list = await searchRegistrations({
        relative_id_number: isId ? term : undefined,
        relative_full_name: isId ? undefined : term,
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
    <Page>
      <Header title="Tra cứu hồ sơ" />
      <Box style={{ padding: "0 16px 16px" }}>
        <Text size="small" style={{ color: "#888", marginBottom: 10, display: "block" }}>
          Nhập số CCCD/CMND hoặc họ tên người đăng ký.
        </Text>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="CCCD hoặc họ tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
            />
          </div>
          <button
            className="btn btn--primary"
            onClick={onSubmit}
            disabled={searching}
          >
            {searching ? "..." : "Tra cứu"}
          </button>
        </div>

        {error && <div className="notification notification--danger">{error}</div>}

        {results !== null && results.length === 0 && (
          <div className="notification notification--warning">
            Không tìm thấy hồ sơ nào.
          </div>
        )}

        {results !== null && results.length > 0 && (
          <div className="result-list">
            {results.map((r) => (
              <div key={r.id} className="result-item">
                <div className="result-item__row">
                  <span className="result-item__label">Mã #{r.id}</span>
                  <StatusTag status={r.status} />
                </div>
                <div className="result-item__row">
                  <span className="result-item__label">Đăng ký</span>
                  <span className="result-item__value">{r.relative_full_name}</span>
                </div>
                <div className="result-item__row">
                  <span className="result-item__label">Phạm nhân</span>
                  <span className="result-item__value">{r.prisoner_full_name}</span>
                </div>
                <div className="result-item__row">
                  <span className="result-item__label">Thăm gặp</span>
                  <span className="result-item__value">
                    {formatDate(r.visit_date)} · {SESSION_LABELS[r.visit_session] || r.visit_session}
                  </span>
                </div>
                <div className="result-item__row">
                  <span className="result-item__label">Số gọi</span>
                  <span className="result-item__value">
                    {r.call_number ? `#${r.call_number}` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>
    </Page>
  );
};

export default LookupPage;
