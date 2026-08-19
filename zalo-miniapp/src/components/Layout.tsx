import React from "react";
import { Box } from "zmp-ui";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/index";
import RegisterPage from "../pages/register";
import LookupPage from "../pages/lookup";
import BoardPage from "../pages/board";
import Navigation from "./Navigation";

const Layout: React.FC = () => (
  <Box flex flexDirection="column" style={{ height: "100vh" }}>
    <Box style={{ flex: 1, overflow: "auto" }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        <Route path="/tra-cuu" element={<LookupPage />} />
        <Route path="/bang-so" element={<BoardPage />} />
      </Routes>
    </Box>
    <Navigation />
  </Box>
);

export default Layout;
