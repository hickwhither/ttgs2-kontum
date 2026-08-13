import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { getCurrentAdmin, logoutAdmin, AdminUser } from "../../api.js";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentAdmin()
      .then(setAdmin)
      .catch(() => navigate("/admin/login", { replace: true }))
      .finally(() => setChecking(false));
  }, [navigate]);

  async function onLogout() {
    try {
      await logoutAdmin();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  }

  if (checking) {
    return (
      <div className="has-text-centered mt-6">
        <p className="has-text-grey">Đang kiểm tra đăng nhập…</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div>
      <nav className="level mb-5">
        <div className="level-left">
          <div className="level-item">
            <p className="title is-4">Quản trị</p>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <p className="has-text-grey-dark">
              {admin.username} ·{" "}
              <button type="button" className="button is-small is-light" onClick={onLogout}>
                Đăng xuất
              </button>
            </p>
          </div>
        </div>
      </nav>

      <div className="tabs is-boxed">
        <ul>
          <li>
            <NavLink to="/admin/registrations" className={({ isActive }) => (isActive ? "is-active" : "")}>
              Hồ sơ đăng ký
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/ban-so" className={({ isActive }) => (isActive ? "is-active" : "")}>
              Bảng số gọi
            </NavLink>
          </li>
          <li>
            <Link to="/bang-so">Xem bảng công cộng</Link>
          </li>
        </ul>
      </div>

      <Outlet />
    </div>
  );
}
