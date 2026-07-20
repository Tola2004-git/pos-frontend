import { useState, useRef, useEffect, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RiSearchLine } from "react-icons/ri";
import { glass, glassCard, colors } from "../../utils/styles";
import { SearchNormal1, Calendar } from "iconsax-react";

function toDateObj(str) {
  return str ? new Date(`${str}T00:00:00`) : null;
}

function toDateStr(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

function formatDisplayDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
}

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

function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  disabled,
  tooltip,
  placeholder,
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

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.0)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

const STATUS_OPTIONS = ["all", "completed", "pending", "cancelled", "refunded"];

export default function OrdersFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  datesDisabled = false,
  cashiers,
  cashierFilter,
  onCashierChange,
  t,
}) {
  const STATUS_LABELS = {
    all: t?.statusAll || "All Status",
    completed: t?.statusCompleted || "Completed",
    pending: t?.statusPending || "Pending",
    cancelled: t?.statusCancelled || "Cancelled",
    refunded: t?.statusRefunded || "Refunded",
  };
  const searchPlaceholder = t?.searchOrdersPlaceholder || "Search by order#, customer...";
  const dateTooltip = t?.uncheckShiftOnlyForDate || 'Uncheck "Current Shift Only" to filter by date';
  const allCashiersLabel = t?.allCashiers || "All Cashiers";
  const selectDateRangeLabel = t?.selectDateRange || "Select date range";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showCashierDropdown, setShowCashierDropdown] = useState(false);
  const cashierDropdownRef = useRef(null);
  const selectedCashierName =
    cashiers?.find((c) => String(c.id) === String(cashierFilter))?.name;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cashierDropdownRef.current && !cashierDropdownRef.current.contains(e.target)) {
        setShowCashierDropdown(false);
      }
    };
    if (showCashierDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCashierDropdown]);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: "16px",
          padding: "12px 16px",
          flex: 1,
          minWidth: "200px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <SearchNormal1 size={20} color="#fff" variant="bulk" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            ...inputStyle,
            border: "none",
            background: "transparent",
            padding: "0",
            flex: 1,
          }}
        />
      </div>

      <DateRangePicker
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        disabled={datesDisabled}
        tooltip={datesDisabled ? dateTooltip : undefined}
        placeholder={selectDateRangeLabel}
      />

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          style={{
            ...glassCard,
            padding: "12px 18px",
            borderRadius: "16px",
            cursor: "pointer",
            color: "white",
            fontWeight: 600,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          {statusFilter === "all" ? STATUS_LABELS.all : STATUS_LABELS[statusFilter]}
          <span style={{ fontSize: "0.7rem" }}>{showDropdown ? "▲" : "▼"}</span>
        </button>

        <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {showDropdown && (
          <div
            style={{
              ...glassCard,
              position: "absolute",
              top: "110%",
              right: 0,
              borderRadius: "14px",
              zIndex: 99999,
              minWidth: "160px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "dropdownFade 0.2s ease",
              transformOrigin: "top right",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setShowDropdown(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background:
                    statusFilter === s
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    statusFilter === s
                      ? colors.white
                      : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: statusFilter === s ? 700 : 400,
                  textAlign: "left",
                  borderLeft:
                    statusFilter === s
                      ? `3px solid ${colors.white}`
                      : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    statusFilter === s
                      ? "rgba(255,255,255,0.15)"
                      : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {cashiers && (
        <div ref={cashierDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowCashierDropdown((v) => !v)}
            style={{
              ...glassCard,
              padding: "12px 18px",
              borderRadius: "16px",
              cursor: "pointer",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            {selectedCashierName || allCashiersLabel}
            <span style={{ fontSize: "0.7rem" }}>{showCashierDropdown ? "▲" : "▼"}</span>
          </button>

          {showCashierDropdown && (
            <div
              style={{
                ...glassCard,
                position: "absolute",
                top: "110%",
                right: 0,
                borderRadius: "14px",
                zIndex: 99999,
                minWidth: "180px",
                maxHeight: "280px",
                overflowY: "auto",
                boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
                animation: "dropdownFade 0.2s ease",
                transformOrigin: "top right",
              }}
            >
              <button
                onClick={() => {
                  onCashierChange("");
                  setShowCashierDropdown(false);
                }}
                style={{
                  display: "flex",
                  width: "100%",
                  padding: "11px 16px",
                  background: !cashierFilter ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: !cashierFilter ? colors.white : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: !cashierFilter ? 700 : 400,
                  textAlign: "left",
                  borderLeft: !cashierFilter ? `3px solid ${colors.white}` : "3px solid transparent",
                }}
              >
                {allCashiersLabel}
              </button>
              {cashiers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onCashierChange(String(c.id));
                    setShowCashierDropdown(false);
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "11px 16px",
                    background:
                      String(cashierFilter) === String(c.id) ? "rgba(255,255,255,0.15)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: String(cashierFilter) === String(c.id) ? colors.white : "rgba(255,255,255,0.85)",
                    fontSize: "0.88rem",
                    fontWeight: String(cashierFilter) === String(c.id) ? 700 : 400,
                    textAlign: "left",
                    borderLeft:
                      String(cashierFilter) === String(c.id)
                        ? `3px solid ${colors.white}`
                        : "3px solid transparent",
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
