import React, { useEffect, useState, useCallback } from "react";
import { Page, Header, Box } from "zmp-ui";
import { getQueueBoard, QueueBoard, VisitSession } from "../api";
import { formatDate, todayIso } from "../utils/date";

const SESSIONS: VisitSession[] = ["morning", "afternoon"];
const SESSION_LABELS: Record<VisitSession, string> = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
};

function BoardCard({ board }: { board: QueueBoard }) {
  return (
    <div className="card">
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1565C0", marginBottom: 12 }}>
        {board.session_label}
      </div>

      <div className={`board-number ${board.now_serving === 0 ? "board-number--empty" : ""}`}>
        <div className="board-number__label">ĐANG GỌI</div>
        <div className="board-number__value">
          {board.now_serving > 0 ? `#${board.now_serving}` : "Chưa bắt đầu"}
        </div>
        {board.currently_called && (
          <div className="board-number__name">{board.currently_called.full_name}</div>
        )}
      </div>

      <div style={{ fontSize: 13, color: "#888", marginTop: 12, marginBottom: 8 }}>
        Còn <strong>{board.waiting_count}</strong> hồ sơ chờ
      </div>

      {board.waiting.length > 0 ? (
        <div className="waiting-grid">
          {board.waiting.map((w) => (
            <div key={w.call_number} className="waiting-item">
              <div className="waiting-item__number">#{w.call_number}</div>
              <div className="waiting-item__name">{w.full_name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#bbb", textAlign: "center", padding: "8px 0" }}>
          Không có hồ sơ chờ
        </div>
      )}
    </div>
  );
}

const BoardPage: React.FC = () => {
  const [visitDate] = useState(todayIso());
  const [boards, setBoards] = useState<Partial<Record<VisitSession, QueueBoard>>>({});
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const next: Partial<Record<VisitSession, QueueBoard>> = {};
    try {
      for (const session of SESSIONS) {
        next[session] = await getQueueBoard(visitDate, session);
      }
      setBoards(next);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [visitDate]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <Page>
      <Header title="Bảng số gọi" />
      <Box style={{ padding: "0 16px 16px" }}>
        <div className="card-subtitle" style={{ marginBottom: 12 }}>
          {formatDate(visitDate)} · Tự cập nhật mỗi 10 giây
        </div>

        {error && <div className="notification notification--danger">{error}</div>}

        {SESSIONS.map((session) => {
          const board = boards[session];
          return board ? (
            <BoardCard key={session} board={board} />
          ) : (
            <div key={session} className="loading">
              Đang tải {SESSION_LABELS[session]}...
            </div>
          );
        })}
      </Box>
    </Page>
  );
};

export default BoardPage;
