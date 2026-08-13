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

function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header className="top-banner">
        <div className="container">
          <p className="title is-4 top-banner-title">Trang thông tin điện tử Trại giam số 2</p>
          <p className="subtitle is-6 top-banner-subtitle">
            Hệ thống đăng ký thăm gặp thân nhân - Công an tỉnh Kon Tum
          </p>
        </div>
      </header>

      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <NavLink to="/" className="navbar-item">
              <img src="/logo.jpg" alt="Logo" className="navbar-logo" />
              <span>Trại tạm giam số 2</span>
            </NavLink>
          </div>
          <div className="navbar-menu">
            <div className="navbar-start">
              <NavLink to="/" className="navbar-item" end>
                Trang chủ
              </NavLink>
              <NavLink to="/dang-ky" className="navbar-item">
                Đăng ký thăm gặp
              </NavLink>
              <NavLink to="/tra-cuu" className="navbar-item">
                Tra cứu hồ sơ
              </NavLink>
              <NavLink to="/bang-so" className="navbar-item">
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

      <main className="container is-max-desktop">
        {children}
      </main>

      <footer className="footer-light">
        <div className="container">
          <div className="columns">
            <div className="column">
              <p className="title">Trang thông tin điện tử Trại giam số 2</p>
              <p className="is-size-7 has-text-grey">
                Cơ quan chủ quản: Trại giam số 2 - Công an tỉnh Kon Tum
              </p>
            </div>
            <div className="column">
              <p className="title">Liên hệ</p>
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
