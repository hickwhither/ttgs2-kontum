import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Page, Header, Box, Input, Text } from "zmp-ui";
import { createRegistration, Registration, SESSION_LABELS } from "../api";
import { todayIso, toDmy, parseDmy } from "../utils/date";

const currentYear = new Date().getFullYear();

interface FormData {
  relative_full_name: string;
  relative_date_of_birth: string;
  relative_registered_residence: string;
  relative_id_number: string;
  relative_relationship: string;
  prisoner_full_name: string;
  prisoner_date_of_birth: string;
  prisoner_registered_residence: string;
  prisoner_offense: string;
  prisoner_arrest_date: string;
  visit_date: string;
  visit_session: "morning" | "afternoon";
}

const emptyForm: FormData = {
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

const DATE_FIELDS: (keyof FormData)[] = [
  "relative_date_of_birth",
  "prisoner_date_of_birth",
  "prisoner_arrest_date",
  "visit_date",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <div className="field-label">{label}</div>
      <div className="field-input">{children}</div>
    </div>
  );
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function onDateChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit() {
    setError("");
    setResult(null);

    const payload = { ...form };
    for (const field of DATE_FIELDS) {
      const iso = parseDmy(form[field]);
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
      const created = await createRegistration(payload as Parameters<typeof createRegistration>[0]);
      setResult(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Page>
        <Header title="Đăng ký thành công" />
        <Box style={{ padding: "32px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <Text.Title size="normal" style={{ fontWeight: 700, marginBottom: 12 }}>
            Đăng ký thành công
          </Text.Title>
          <Text>Mã hồ sơ: <strong>{result.id}</strong></Text>
          <Text style={{ marginTop: 4 }}>
            Ngày: <strong>{result.visit_date}</strong> · {SESSION_LABELS[result.visit_session]}
          </Text>
          <Text size="small" style={{ color: "#888", marginTop: 12, display: "block" }}>
            Cán bộ trại sẽ xác nhận và cấp số gọi. Kiểm tra tại tab "Tra cứu".
          </Text>
          <div className="btn-group" style={{ justifyContent: "center", marginTop: 20 }}>
            <button className="btn btn--primary" onClick={() => { setResult(null); setForm(emptyForm); }}>
              Đăng ký thêm
            </button>
            <button className="btn btn--ghost" onClick={() => navigate("/")}>
              Về trang chủ
            </button>
          </div>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <Header title="Đăng ký thăm gặp" />
      <Box style={{ padding: "0 16px 16px" }}>
        <Text size="small" style={{ color: "#888", marginBottom: 12, display: "block" }}>
          Điền đúng thông tin theo giấy tờ tùy thân (CCCD/CMND).
        </Text>

        {error && <div className="notification notification--danger">{error}</div>}

        <div className="card">
          <div className="card-title">THÂN NHÂN CAN PHẠM NHÂN</div>
          <Field label="Họ và tên">
            <Input placeholder="Nguyễn Văn A" value={form.relative_full_name} onChange={set("relative_full_name")} />
          </Field>
          <Field label="Ngày sinh">
            <input className="date-field__input" type="text" value={form.relative_date_of_birth} onChange={(e) => onDateChange("relative_date_of_birth", e.target.value)} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="Nơi đăng ký thường trú">
            <Input placeholder="Tỉnh/TP..." value={form.relative_registered_residence} onChange={set("relative_registered_residence")} />
          </Field>
          <Field label="Số CCCD / CMND">
            <Input placeholder="001234567890" value={form.relative_id_number} onChange={set("relative_id_number")} />
          </Field>
          <Field label="Quan hệ với can phạm nhân">
            <Input placeholder="Vợ, chồng, con..." value={form.relative_relationship} onChange={set("relative_relationship")} />
          </Field>
        </div>

        <div className="card">
          <div className="card-title">CAN PHẠM NHÂN</div>
          <Field label="Họ và tên">
            <Input placeholder="Trần Văn B" value={form.prisoner_full_name} onChange={set("prisoner_full_name")} />
          </Field>
          <Field label="Ngày sinh">
            <input className="date-field__input" type="text" value={form.prisoner_date_of_birth} onChange={(e) => onDateChange("prisoner_date_of_birth", e.target.value)} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="Nơi đăng ký thường trú">
            <Input placeholder="Tỉnh/TP..." value={form.prisoner_registered_residence} onChange={set("prisoner_registered_residence")} />
          </Field>
          <Field label="Tội danh">
            <Input placeholder="Trộm cắp tài sản" value={form.prisoner_offense} onChange={set("prisoner_offense")} />
          </Field>
          <Field label="Ngày bắt">
            <input className="date-field__input" type="text" value={form.prisoner_arrest_date} onChange={(e) => onDateChange("prisoner_arrest_date", e.target.value)} placeholder="DD/MM/YYYY" />
          </Field>
        </div>

        <div className="card">
          <div className="card-title">THỜI GIAN THĂM GẶP</div>
          <Field label="Ngày thăm gặp dự kiến">
            <input className="date-field__input" type="text" value={form.visit_date} onChange={(e) => onDateChange("visit_date", e.target.value)} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="Buổi">
            <div className="select" style={{ width: "100%" }}>
              <select
                className="date-field__input"
                value={form.visit_session}
                onChange={set("visit_session")}
              >
                <option value="morning">{SESSION_LABELS.morning}</option>
                <option value="afternoon">{SESSION_LABELS.afternoon}</option>
              </select>
            </div>
          </Field>
        </div>

        <div className="btn-group">
          <button
            className="btn btn--primary btn--full"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Đăng ký"}
          </button>
        </div>
        <div className="btn-group" style={{ justifyContent: "center", marginTop: 8 }}>
          <button className="btn btn--ghost" onClick={() => navigate("/")}>
            Quay lại
          </button>
        </div>
      </Box>
    </Page>
  );
};

export default RegisterPage;
