import { useEffect, useState } from "react";
import {
  getQueueBoard,
  callNext,
  resetQueue,
  SESSION_LABELS,
  formatDate,
  todayIso,
  toDmy,
  parseDmy,
  QueueBoard,
  VisitSession,
} from "../../api.js";

const SESSIONS: VisitSession[] = ["morning", "afternoon"];

export default function CallBoard() {
  const [visitDateDmy, setVisitDateDmy] = useState(toDmy(todayIso()));
  const visitDate = parseDmy(visitDateDmy) || todayIso();
  const [boards, setBoards] = useState<Partial<Record<VisitSession, QueueBoard>>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<Record<VisitSession, boolean>>({ morning: false, afternoon: false });

  async function load() {
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
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitDate]);

  async function onCallNext(session: VisitSession) {
    setError("");
    setBusy((prev) => ({ ...prev, [session]: true }));
    try {
      const board = await callNext(visitDate, session);
      setBoards((prev) => ({ ...prev, [session]: board }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy((prev) => ({ ...prev, [session]: false }));
    }
  }

  async function onReset(session: VisitSession) {
    if (!window.confirm(`Đặt lại bảng số gọi buổi ${SESSION_LABELS[session]}?`)) return;
    setError("");
    try {
      const board = await resetQueue(visitDate, session);
      setBoards((prev) => ({ ...prev, [session]: board }));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div>
      <h1 className="title is-5">Bảng số gọi</h1>

      <div className="field">
        <label className="label is-size-6">Ngày thăm gặp</label>
        <div className="control">
          <input
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/YYYY"
            value={visitDateDmy}
            onChange={(e) => setVisitDateDmy(e.target.value)}
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
                        <p className="is-size-7 has-text-grey">SỐ ĐANG GỌI</p>
                        <p className="title is-1 has-text-success">
                          {board.now_serving || "—"}
                        </p>
                        {board.currently_called && (
                          <p className="is-size-6 has-text-grey-dark">
                            {board.currently_called.full_name}
                          </p>
                        )}
                      </div>

                      <div className="buttons is-centered mb-4">
                        <button
                          className={`button is-link ${busy[session] ? "is-loading" : ""}`}
                          disabled={busy[session]}
                          onClick={() => void onCallNext(session)}
                        >
                          Gọi tiếp
                        </button>
                        <button className="button is-light" onClick={() => void onReset(session)}>
                          Đặt lại
                        </button>
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
