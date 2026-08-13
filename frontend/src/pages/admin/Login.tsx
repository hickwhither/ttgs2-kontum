import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin } from "../../api.js";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginAdmin(username.trim(), password);
      navigate("/admin/registrations", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="columns is-centered">
      <div className="column is-half">
        <div className="card">
          <div className="card-content">
            <h1 className="title is-4">Đăng nhập quản trị</h1>
            <p className="subtitle is-6 has-text-grey">Trại tạm giam số 2 - Kon Tum</p>

            {error && <div className="notification is-danger is-light">{error}</div>}

            <form onSubmit={onSubmit}>
              <div className="field">
                <label className="label">Tên đăng nhập</label>
                <div className="control">
                  <input
                    className="input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="field">
                <label className="label">Mật khẩu</label>
                <div className="control">
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <div className="field is-grouped mt-4">
                <div className="control">
                  <button type="submit" className={`button is-link ${submitting ? "is-loading" : ""}`} disabled={submitting}>
                    Đăng nhập
                  </button>
                </div>
                <div className="control">
                  <Link to="/" className="button is-light">Về trang chủ</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
