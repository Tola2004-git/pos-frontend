import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "iconsax-react";

function toDateObj(str) {
  return str ? new Date(`${str}T00:00:00`) : null;
}

function toDateStr(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplayDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}

const DateRangeTrigger = forwardRef(
  ({ value, onClick, disabled, placeholder, title }, ref) => (
    <button
      type="button"
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        width: "auto",
        padding: "12px 14px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.0)",
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
        color: "white",
        fontSize: "0.9rem",
        outline: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        whiteSpace: "nowrap",
      }}
    >
      <Calendar size={16} color="#fff" variant="Outline" />
      {value || placeholder}
    </button>
  ),
);
DateRangeTrigger.displayName = "DateRangeTrigger";

const DATEPICKER_DARK_THEME_CSS = `
.pos-datepicker-popper {
  z-index: 100000;
}
.pos-datepicker-dark.react-datepicker {
  background: #1e272e;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px;
  overflow: hidden;
  font-family: inherit;
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
}
.pos-datepicker-dark .react-datepicker__triangle {
  display: none;
}
.pos-datepicker-dark .react-datepicker__header {
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.pos-datepicker-dark .react-datepicker__current-month,
.pos-datepicker-dark .react-datepicker-time__header {
  color: white;
  font-weight: 600;
}
.pos-datepicker-dark .react-datepicker__day-name {
  color: rgba(255,255,255,0.5);
}
.pos-datepicker-dark .react-datepicker__day {
  color: rgba(255,255,255,0.85);
  border-radius: 8px;
}
.pos-datepicker-dark .react-datepicker__day:hover {
  background: rgba(255,255,255,0.12);
}
.pos-datepicker-dark .react-datepicker__day--outside-month {
  color: rgba(255,255,255,0.25);
}
.pos-datepicker-dark .react-datepicker__day--disabled {
  color: rgba(255,255,255,0.2);
}
.pos-datepicker-dark .react-datepicker__day--selected,
.pos-datepicker-dark .react-datepicker__day--range-start,
.pos-datepicker-dark .react-datepicker__day--range-end,
.pos-datepicker-dark .react-datepicker__day--keyboard-selected {
  background: #3b82f6;
  color: white;
}
.pos-datepicker-dark .react-datepicker__day--in-range,
.pos-datepicker-dark .react-datepicker__day--in-selecting-range {
  background: rgba(59,130,246,0.3);
  color: white;
}
.pos-datepicker-dark .react-datepicker__navigation-icon::before {
  border-color: rgba(255,255,255,0.6);
}
.pos-datepicker-dark .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
  border-color: white;
}
`;

// Single glass-styled trigger button that opens one calendar popup for
// picking both ends of a date range - shared by OrdersFilter and the
// Dashboard's "Custom" period so the dark react-datepicker theme only
// lives in one place.
export default function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  disabled,
  tooltip,
  placeholder,
  maxDate,
}) {
  const startDate = toDateObj(dateFrom);
  const endDate = toDateObj(dateTo);
  const displayValue =
    startDate && endDate
      ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
      : "";

  return (
    <>
      <style>{DATEPICKER_DARK_THEME_CSS}</style>
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        maxDate={maxDate}
        onChange={(dates) => {
          const [start, end] = dates;
          onDateFromChange(toDateStr(start));
          onDateToChange(toDateStr(end));
        }}
        disabled={disabled}
        popperClassName="pos-datepicker-popper"
        calendarClassName="pos-datepicker-dark"
        customInput={
          <DateRangeTrigger
            value={displayValue}
            placeholder={placeholder}
            title={tooltip}
            disabled={disabled}
          />
        }
      />
    </>
  );
}
