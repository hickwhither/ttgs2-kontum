import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import DatePicker from "../components/DatePicker.js";
import {
  createRegistration,
  SESSION_LABELS,
  Registration,
  RegistrationPayload,
  formatDate,
  todayIso,
  toDmy,
  parseDmy,
} from "../api.js";

const DATE_FIELDS = [
  "relative_date_of_birth",
  "prisoner_date_of_birth",
  "prisoner_arrest_date",
  "visit_date",
];

const currentYear = new Date().getFullYear();

const emptyForm: RegistrationPayload = {
  relative_full_name: "",
  relative_date_of_birth: "01/01/1990",
  relative_registered_residence: "",
  relative_id_number: "",
  relative_relationship: "",
  prisoner_full_name: "",
  prisoner_date_of_birth: "01/01/1988",
  prisoner_registered_residence: "",
  prisoner_offense: "",
  prisoner_arrest_date: `01/01/${currentYear - 2}`,
  visit_date: toDmy(todayIso()),
  visit_session: "morning",
};

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="field">
      <label className="label is-size-6">{label}</label>
      <div className="control">{children}</div>
    </div>
  );
}

export default function Register() {
  const [form, setForm] = useState<RegistrationPayload>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);

  function set(field: keyof RegistrationPayload) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    const payload = { ...form };
    for (const field of DATE_FIELDS) {
      const iso = parseDmy(form[field as keyof RegistrationPayload]);
      if (!iso) {
        setError(`Ngày "${field}" phải theo định dạng DD/MM/YYYY.`);
        return;
      }
      (payload as Record<string, string>)[field] = iso;
    }
    if (payload.visit_date < todayIso()) {
      setError("Ngày thăm gặp dự kiến không được ở trong quá khứ.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createRegistration(payload);
      setResult(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="card">
        <div className="card-content has-text-centered">
          <span className="icon has-text-success is-large">
            <i className="fas fa-check-circle fa-3x"></i>
          </span>
          <p className="title is-4 mt-3">Đăng ký thành công</p>
          <p className="is-size-6">
            Mã hồ sơ: <strong>{result.id}</strong>
          </p>
          <p className="is-size-6">
            Ngày thăm gặp: <strong>{formatDate(result.visit_date)}</strong> ·{" "}
            {SESSION_LABELS[result.visit_session]}
          </p>
          <p className="is-size-7 has-text-grey mt-3">
            Cán bộ trại sẽ xác nhận hồ sơ và cấp số gọi. Vui lòng kiểm tra{" "}
            <Link to="/tra-cuu">Tra cứu hồ sơ</Link> hoặc bảng số gọi trước ngày thăm gặp.
          </p>
          <div className="buttons is-centered mt-4">
            <button className="button is-link" onClick={() => { setResult(null); setForm(emptyForm); }}>
              Đăng ký thêm
            </button>
            <Link to="/" className="button is-light">Về trang chủ</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      <h1 className="title is-4">Đăng ký thăm gặp thân nhân</h1>
      <p className="subtitle is-6 has-text-grey">
        Vui lòng điền đúng thông tin theo giấy tờ tùy thân (CCCD/CMND).
      </p>

      {error && (
        <div className="notification is-danger is-light">{error}</div>
      )}

      <form onSubmit={onSubmit} className="card">
        <div className="card-content">
          <h2 className="title is-6 has-text-link">THÂN NHÂN CAN PHẠM NHÂN</h2>
          <div className="columns is-multiline">
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Họ và tên người đăng ký">
                <input className="input" type="text" value={form.relative_full_name} onChange={set("relative_full_name")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Ngày, tháng, năm sinh">
                <DatePicker
                  value={form.relative_date_of_birth}
                  onChange={(v) => setForm((prev) => ({ ...prev, relative_date_of_birth: v }))}
                  startYear={1950}
                  endYear={currentYear}
                  defaultYear={1990}
                />
              </Field>
            </div>
            <div className="column is-12">
              <Field label="Nơi đăng ký thường trú">
                <input className="input" type="text" value={form.relative_registered_residence} onChange={set("relative_registered_residence")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Số CCCD / CMND">
                <input className="input" type="text" value={form.relative_id_number} onChange={set("relative_id_number")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Quan hệ với can phạm nhân">
                <input className="input" type="text" value={form.relative_relationship} onChange={set("relative_relationship")} required placeholder="VD: Vợ, chồng, con, anh/chị em…" />
              </Field>
            </div>
          </div>

          <hr />

          <h2 className="title is-6 has-text-link">CAN PHẠM NHÂN</h2>
          <div className="columns is-multiline">
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Họ và tên">
                <input className="input" type="text" value={form.prisoner_full_name} onChange={set("prisoner_full_name")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Ngày, tháng, năm sinh">
                <DatePicker
                  value={form.prisoner_date_of_birth}
                  onChange={(v) => setForm((prev) => ({ ...prev, prisoner_date_of_birth: v }))}
                  startYear={1950}
                  endYear={currentYear}
                  defaultYear={1988}
                />
              </Field>
            </div>
            <div className="column is-12">
              <Field label="Nơi đăng ký thường trú">
                <input className="input" type="text" value={form.prisoner_registered_residence} onChange={set("prisoner_registered_residence")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Tội danh">
                <input className="input" type="text" value={form.prisoner_offense} onChange={set("prisoner_offense")} required />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Ngày bắt">
                <DatePicker
                  value={form.prisoner_arrest_date}
                  onChange={(v) => setForm((prev) => ({ ...prev, prisoner_arrest_date: v }))}
                  startYear={1950}
                  endYear={currentYear}
                  defaultYear={currentYear - 2}
                />
              </Field>
            </div>
          </div>

          <hr />

          <h2 className="title is-6 has-text-link">THỜI GIAN ĐĂNG KÝ THĂM GẶP</h2>
          <div className="columns is-multiline">
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Ngày thăm gặp dự kiến">
                <DatePicker
                  value={form.visit_date}
                  onChange={(v) => setForm((prev) => ({ ...prev, visit_date: v }))}
                  startYear={currentYear - 1}
                  endYear={currentYear + 2}
                  defaultYear={currentYear}
                />
              </Field>
            </div>
            <div className="column is-12-mobile is-6-tablet">
              <Field label="Buổi sáng/chiều">
                <div className="select is-fullwidth">
                  <select value={form.visit_session} onChange={set("visit_session")} required>
                    <option value="morning">Buổi sáng</option>
                    <option value="afternoon">Buổi chiều</option>
                  </select>
                </div>
              </Field>
            </div>
          </div>

          <div className="field is-grouped mt-5">
            <div className="control">
              <button type="submit" className={`button is-link ${submitting ? "is-loading" : ""}`} disabled={submitting}>
                Đăng ký
              </button>
            </div>
            <div className="control">
              <Link to="/" className="button is-light">Quay lại</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
