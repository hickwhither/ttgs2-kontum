import { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { parseDmy } from "../api.js";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  startYear?: number;
  endYear?: number;
  defaultYear?: number;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  startYear,
  endYear,
  defaultYear,
  disabled,
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<flatpickr.Instance | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const fromYear = startYear ?? currentYear - 100;
  const toYear = endYear ?? currentYear + 2;
  const fallbackYear = defaultYear ?? currentYear;

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const initial = parseDmy(value) ? value : `01/01/${fallbackYear}`;
    const fp = flatpickr(el, {
      dateFormat: "d/m/Y",
      locale: Vietnamese,
      allowInput: true,
      minDate: `01/01/${fromYear}`,
      maxDate: `31/12/${toYear}`,
      defaultDate: initial,
      onChange: (_dates, dateStr) => onChangeRef.current(dateStr),
    });
    instanceRef.current = fp;
    return () => {
      fp.destroy();
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    instanceRef.current?.set("minDate", `01/01/${fromYear}`);
    instanceRef.current?.set("maxDate", `31/12/${toYear}`);
  }, [fromYear, toYear]);

  useEffect(() => {
    instanceRef.current?.set("clickOpens", !disabled);
    if (inputRef.current) inputRef.current.disabled = !!disabled;
  }, [disabled]);

  useEffect(() => {
    const fp = instanceRef.current;
    if (!fp) return;
    if (parseDmy(value)) {
      fp.setDate(value, false);
    } else {
      fp.clear(false);
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      className="input"
      aria-label="Chọn ngày"
      disabled={disabled}
    />
  );
}
