export type VisitSession = "morning" | "afternoon";
export type Status = "incomplete" | "processing" | "confirmed" | "rejected";

export interface RegistrationPayload {
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
  visit_session: VisitSession;
}

export interface Registration extends RegistrationPayload {
  id: number;
  status: Status;
  call_number: number | null;
}

export interface RegistrationPatch {
  status?: Status;
  visit_date?: string;
  visit_session?: VisitSession;
  relative_full_name?: string;
  relative_date_of_birth?: string;
  relative_registered_residence?: string;
  relative_id_number?: string;
  relative_relationship?: string;
  prisoner_full_name?: string;
  prisoner_date_of_birth?: string;
  prisoner_registered_residence?: string;
  prisoner_offense?: string;
  prisoner_arrest_date?: string;
}

export interface RegistrationQueryParams {
  status?: Status;
  visit_date?: string;
  relative_id_number?: string;
  relative_full_name?: string;
  prisoner_full_name?: string;
  limit?: number;
  offset?: number;
}

export interface QueueEntry {
  call_number: number;
  full_name: string;
}

export interface QueueBoard {
  visit_date: string;
  visit_session: VisitSession;
  session_label: string;
  now_serving: number;
  currently_called: QueueEntry | null;
  waiting: QueueEntry[];
  waiting_count: number;
}

export interface AdminUser {
  id: number;
  username: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = `Lỗi máy chủ (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: unknown };
      if (body && body.detail) {
        detail = Array.isArray(body.detail)
          ? body.detail.map((d) => (typeof d === "object" && d && "msg" in d ? String(d.msg) : JSON.stringify(d))).join("; ")
          : String(body.detail);
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

export function createRegistration(payload: RegistrationPayload): Promise<Registration> {
  return request<Registration>("/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function searchRegistrations(params: RegistrationQueryParams = {}): Promise<Registration[]> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  return request<Registration[]>(`/registrations?${qs.toString()}`);
}

export function getRegistration(id: number): Promise<Registration> {
  return request<Registration>(`/registrations/${id}`);
}

export function patchRegistration(id: number, payload: RegistrationPatch): Promise<Registration> {
  return request<Registration>(`/registrations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRegistration(id: number): Promise<void> {
  return request<void>(`/registrations/${id}`, { method: "DELETE" });
}

export function getQueueBoard(visitDate: string, visitSession: VisitSession): Promise<QueueBoard> {
  return request<QueueBoard>(`/queue/${visitDate}/${visitSession}`);
}

export function callNext(visitDate: string, visitSession: VisitSession): Promise<QueueBoard> {
  return request<QueueBoard>(`/queue/${visitDate}/${visitSession}/call-next`, { method: "POST" });
}

export function resetQueue(visitDate: string, visitSession: VisitSession): Promise<QueueBoard> {
  return request<QueueBoard>(`/queue/${visitDate}/${visitSession}/reset`, { method: "POST" });
}

export function loginAdmin(username: string, password: string): Promise<AdminUser> {
  return request<AdminUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logoutAdmin(): Promise<{ message: string }> {
  return request("/auth/logout", { method: "POST" });
}

export function getCurrentAdmin(): Promise<AdminUser> {
  return request<AdminUser>("/auth/me");
}

export const SESSION_LABELS: Record<VisitSession, string> = {
  morning: "Buổi sáng",
  afternoon: "Buổi chiều",
};

export const STATUS_LABELS: Record<Status, string> = {
  incomplete: "Thiếu thông tin",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
};

export const STATUS_COLORS: Record<Status, string> = {
  incomplete: "is-warning",
  processing: "is-info",
  confirmed: "is-success",
  rejected: "is-danger",
};

export const STATUS_OPTIONS: Status[] = ["incomplete", "processing", "confirmed", "rejected"];

export function formatDate(iso: string): string {
  return toDmy(iso);
}

export function toDmy(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export function parseDmy(dmy: string): string | null {
  if (!dmy) return null;
  const m = String(dmy).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function todayIso(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
