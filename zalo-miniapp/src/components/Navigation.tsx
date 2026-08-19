import React from "react";
import { useLocation, useNavigate } from "react-router";
import { BottomNavigation, Icon } from "zmp-ui";

const tabs: Record<string, { label: string; icon: React.ReactNode }> = {
  "/": { label: "Trang chủ", icon: <Icon icon="zi-home" /> },
  "/dang-ky": { label: "Đăng ký", icon: <Icon icon="zi-plus-circle" /> },
  "/tra-cuu": { label: "Tra cứu", icon: <Icon icon="zi-search" /> },
  "/bang-so": { label: "Số gọi", icon: <Icon icon="zi-notif" /> },
};

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <BottomNavigation
      activeKey={location.pathname}
      onChange={(path) => navigate(path)}
    >
      {Object.keys(tabs).map((path) => (
        <BottomNavigation.Item
          key={path}
          label={tabs[path].label}
          icon={tabs[path].icon}
        />
      ))}
    </BottomNavigation>
  );
};

export default Navigation;
