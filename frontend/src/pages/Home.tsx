import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="card mb-5">
        <div className="card-content">
          <div className="columns is-vcentered">
            <div className="column is-narrow has-text-centered">
              <img src="/logo.jpg" alt="Logo Trại giam số 2" style={{ height: 110, borderRadius: 8 }} />
            </div>
            <div className="column">
              <h1 className="title is-4 mb-2">Hệ thống đăng ký thăm gặp thân nhân</h1>
              <p className="is-size-6 has-text-grey">
                Đăng ký trực tuyến để giảm thời gian chờ đợi. Sau khi đăng ký, cán bộ
                trại sẽ xác nhận hồ sơ và cấp số gọi; xin vui lòng theo dõi bảng số
                gọi công cộng vào ngày thăm gặp.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="columns is-multiline">
        <div className="column is-4">
          <div className="card">
            <div className="card-content has-text-centered">
              <span className="icon is-large has-text-link">
                <i className="fas fa-file-signature fa-2x"></i>
              </span>
              <p className="title is-5 mt-3">1. Đăng ký thông tin</p>
              <p className="is-size-7 has-text-grey">
                Điền đầy đủ thông tin thân nhân và phạm nhân theo giấy tờ tùy thân.
              </p>
              <Link to="/dang-ky" className="button is-link is-fullwidth mt-4">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
        <div className="column is-4">
          <div className="card">
            <div className="card-content has-text-centered">
              <span className="icon is-large has-text-link">
                <i className="fas fa-search fa-2x"></i>
              </span>
              <p className="title is-5 mt-3">2. Tra cứu kết quả</p>
              <p className="is-size-7 has-text-grey">
                Tra cứu trạng thái hồ sơ và số gọi theo số CCCD/CMND hoặc họ tên.
              </p>
              <Link to="/tra-cuu" className="button is-link is-outlined is-fullwidth mt-4">
                Tra cứu hồ sơ
              </Link>
            </div>
          </div>
        </div>
        <div className="column is-4">
          <div className="card">
            <div className="card-content has-text-centered">
              <span className="icon is-large has-text-link">
                <i className="fas fa-tv fa-2x"></i>
              </span>
              <p className="title is-5 mt-3">3. Theo dõi số gọi</p>
              <p className="is-size-7 has-text-grey">
                Xem số đang được gọi và danh sách chờ trong ngày theo từng buổi.
              </p>
              <Link to="/bang-so" className="button is-link is-outlined is-fullwidth mt-4">
                Xem bảng số gọi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
