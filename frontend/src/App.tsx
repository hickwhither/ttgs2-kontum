import { useState } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, NavLink, Navigate, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.js";
import Register from "./pages/Register.js";
import Lookup from "./pages/Lookup.js";
import Board from "./pages/Board.js";
import Login from "./pages/admin/Login.js";
import AdminLayout from "./pages/admin/AdminLayout.js";
import Registrations from "./pages/admin/Registrations.js";
import CallBoard from "./pages/admin/CallBoard.js";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "navbar-item is-active" : "navbar-item";

function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <header>
        <figure className="image">
          <img
            src="/banner.jpg"
            style={{
              width: "100%",
              height: "12rem",
              objectFit: "cover",
            }}
            alt="Trại giam số 2"
          />
        </figure>
      </header>

      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <NavLink to="/" className="navbar-item">
              <figure className="image is-32x32">
                <img src="/logo.jpg" alt="Logo" />
              </figure>
              <span className="ml-2">Trại tạm giam số 2</span>
            </NavLink>
            <a
              role="button"
              className={`navbar-burger ${menuOpen ? "is-active" : ""}`}
              aria-label="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div id="navbarMenu" className={`navbar-menu ${menuOpen ? "is-active" : ""}`}>
            <div className="navbar-start">
              <NavLink to="/" className={navClass} end>
                Trang chủ
              </NavLink>
              <NavLink to="/dang-ky" className={navClass}>
                Đăng ký thăm gặp
              </NavLink>
              <NavLink to="/tra-cuu" className={navClass}>
                Tra cứu hồ sơ
              </NavLink>
              <NavLink to="/bang-so" className={navClass}>
                Bảng số gọi
              </NavLink>
            </div>
            <div className="navbar-end">
              <NavLink to="/admin" className="navbar-item is-size-7 has-text-grey">
                Quản trị
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      <main className="container is-max-desktop pt-4 pb-5">
        {children}
      </main>

      <footer className="footer has-background-light">
        <div className="container">
          <div className="columns">
            <div className="column">
              <p className="title is-6 has-text-link">Trang thông tin điện tử Trại giam số 2</p>
              <p className="is-size-7 has-text-grey">
                Cơ quan chủ quản: Trại giam số 2 - Công an tỉnh Kon Tum
              </p>
            </div>
            <div className="column">
              <p className="title is-6 has-text-link">Liên hệ</p>
              <p className="is-size-7 has-text-grey">
                Hệ thống đăng ký thăm gặp thân nhân trực tuyến
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/tra-cuu" element={<Lookup />} />
          <Route path="/bang-so" element={<Board />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="registrations" replace />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="ban-so" element={<CallBoard />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
