import React from "react";
import { useNavigate } from "react-router";
import { Page, Header, Box, Text } from "zmp-ui";

const cards = [
  {
    path: "/dang-ky",
    icon: "📝",
    colorClass: "home-card__icon--blue",
    title: "Đăng ký thăm gặp",
    desc: "Điền thông tin thân nhân và phạm nhân",
  },
  {
    path: "/tra-cuu",
    icon: "🔍",
    colorClass: "home-card__icon--green",
    title: "Tra cứu hồ sơ",
    desc: "Xem trạng thái và số gọi theo CCCD hoặc họ tên",
  },
  {
    path: "/bang-so",
    icon: "📺",
    colorClass: "home-card__icon--orange",
    title: "Bảng số gọi",
    desc: "Theo dõi số đang gọi và danh sách chờ",
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <Header title="Trại tạm giam số 2" showBackIcon={false} />
      <Box style={{ padding: "16px" }}>
        <div className="card" style={{ textAlign: "center", marginBottom: 20 }}>
          <Text.Title size="normal" style={{ fontWeight: 700 }}>
            Hệ thống đăng ký thăm gặp
          </Text.Title>
          <Text size="small" style={{ color: "#888", marginTop: 6 }}>
            Đăng ký trực tuyến để giảm thời gian chờ đợi. Cán bộ trại sẽ xác
            nhận hồ sơ và cấp số gọi.
          </Text>
        </div>

        <div className="home-grid">
          {cards.map((card) => (
            <div
              key={card.path}
              className="home-card"
              onClick={() => navigate(card.path)}
            >
              <div className={`home-card__icon ${card.colorClass}`}>
                {card.icon}
              </div>
              <div>
                <div className="home-card__title">{card.title}</div>
                <div className="home-card__desc">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Box>
    </Page>
  );
};

export default HomePage;
