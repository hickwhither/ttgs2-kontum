import React from "react";

type Status = "incomplete" | "processing" | "confirmed" | "rejected";

const CLASS_MAP: Record<Status, string> = {
  incomplete: "tag--warning",
  processing: "tag--info",
  confirmed: "tag--success",
  rejected: "tag--danger",
};

const LABEL_MAP: Record<Status, string> = {
  incomplete: "Thiếu thông tin",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
};

interface Props {
  status: Status;
}

const StatusTag: React.FC<Props> = ({ status }) => (
  <span className={`tag ${CLASS_MAP[status] || "tag--info"}`}>
    {LABEL_MAP[status] || status}
  </span>
);

export default StatusTag;
