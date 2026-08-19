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

export interface RegistrationQueryParams {
  status?: Status;
  visit_date?: string;
  relative_id_number?: string;
  relative_full_name?: string;
  prisoner_full_name?: string;
  limit?: number;
  offset?: number;
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
          ? body.detail
              .map((d) => (typeof d === "object" && d && "msg" in d ? String(d.msg) : JSON.stringify(d)))
              .join("; ")
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

export function getQueueBoard(visitDate: string, visitSession: VisitSession): Promise<QueueBoard> {
  return request<QueueBoard>(`/queue/${visitDate}/${visitSession}`);
}
