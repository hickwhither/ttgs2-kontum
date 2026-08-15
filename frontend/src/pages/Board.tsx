import { useEffect, useState } from "react";
import DatePicker from "../components/DatePicker.js";
import {
  getQueueBoard,
  SESSION_LABELS,
  formatDate,
  todayIso,
  toDmy,
  parseDmy,
  QueueBoard,
  VisitSession,
} from "../api.js";

const SESSIONS: VisitSession[] = ["morning", "afternoon"];

export default function Board() {
  const [visitDateDmy, setVisitDateDmy] = useState(toDmy(todayIso()));
  const visitDate = parseDmy(visitDateDmy) || todayIso();
  const [boards, setBoards] = useState<Partial<Record<VisitSession, QueueBoard>>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const next: Partial<Record<VisitSession, QueueBoard>> = {};
      try {
        for (const session of SESSIONS) {
          const data = await getQueueBoard(visitDate, session);
          if (!cancelled) next[session] = data;
        }
        if (!cancelled) {
          setBoards(next);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    }
    load();
    const timer = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [visitDate]);

  return (
    <div>
      <h1 className="title is-4">Bảng số gọi công cộng</h1>
      <p className="subtitle is-6 has-text-grey">
        Số đang gọi và danh sách chờ. Trang tự cập nhật mỗi 10 giây.
      </p>

      <div className="field">
        <label className="label is-size-6">Ngày thăm gặp</label>
        <div className="control">
          <DatePicker
            value={visitDateDmy}
            onChange={setVisitDateDmy}
            startYear={new Date().getFullYear() - 1}
            endYear={new Date().getFullYear() + 2}
            defaultYear={new Date().getFullYear()}
          />
        </div>
      </div>

      {error && <div className="notification is-danger is-light">{error}</div>}

      <div className="columns is-multiline">
        {SESSIONS.map((session) => {
          const board = boards[session];
          return (
            <div className="column is-6" key={session}>
              <div className="card">
                <div className="card-header">
                  <div className="card-header-title">
                    {SESSION_LABELS[session]} · {formatDate(visitDate)}
                  </div>
                </div>
                <div className="card-content">
                  {board ? (
                    <>
                      <div className="has-text-centered mb-4">
                        <p className="is-size-7 has-text-grey">ĐANG GỌI</p>
                        {board.now_serving ? (
                          <p className="title is-1 has-text-success">{board.now_serving}</p>
                        ) : (
                          <p className="title is-4 has-text-grey">Chưa bắt đầu</p>
                        )}
                        {board.currently_called && (
                          <p className="is-size-6 has-text-grey-dark">
                            {board.currently_called.full_name}
                          </p>
                        )}
                      </div>
                      <p className="is-size-7 has-text-grey mb-2">
                        Còn <strong>{board.waiting_count}</strong> hồ sơ chờ
                      </p>
                      {board.waiting.length > 0 ? (
                        <div className="columns is-multiline">
                          {board.waiting.map((w) => (
                            <div className="column is-4" key={w.call_number}>
                              <div className="box has-text-centered" style={{ padding: "0.5rem" }}>
                                <p className="title is-4 mb-0">#{w.call_number}</p>
                                <p className="is-size-7 has-text-grey">{w.full_name}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="is-size-7 has-text-grey">Không có hồ sơ chờ.</p>
                      )}
                    </>
                  ) : (
                    <p className="has-text-grey">Đang tải…</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
