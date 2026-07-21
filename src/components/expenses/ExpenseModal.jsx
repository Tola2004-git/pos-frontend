import { useEffect, useState } from "react";
import { glass, glassCard, colors } from "../../utils/styles";
import {
  MoneyRemove,
  Tag,
  Category,
  DollarCircle,
  Calendar,
  NoteText,
  TickCircle,
  AddCircle,
  Edit,
} from "iconsax-react";

const CATEGORIES = ["rent", "utilities", "salary", "supplies", "maintenance", "other"];

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ExpenseModal({ show, onClose, editExpense, submitting, onSubmit, t }) {
  const [form, setForm] = useState({
    title: "",
    category: "rent",
    amount_usd: "",
    amount_khr: "",
    expense_date: todayStr(),
    note: "",
  });
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    if (!show) return;
    if (!editExpense) {
      setForm({
        title: "",
        category: "rent",
        amount_usd: "",
        amount_khr: "",
        expense_date: todayStr(),
        note: "",
      });
      return;
    }
    setForm({
      title: editExpense.title ?? "",
      category: editExpense.category ?? "rent",
      amount_usd: editExpense.amount_usd ?? "",
      amount_khr: editExpense.amount_khr ?? "",
      expense_date: editExpense.expense_date?.slice(0, 10) ?? todayStr(),
      note: editExpense.note ?? "",
    });
    setError("");
  }, [show, editExpense]);

  if (!show) return null;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
  };
  const labelStyle = {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.85rem",
    display: "block",
    marginBottom: "6px",
  };
  const iconStyle = (field) => ({
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });
  const borderFor = (field) => ({
    border:
      focusedField === field
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.2)",
    transition: "border 0.2s",
  });

  const handleSubmit = () => {
    setError("");
    if (!form.title.trim()) return setError(t.expenseTitleRequiredMsg);
    if (!form.expense_date) return setError(t.expenseDateRequiredMsg);
    const usd = Number(form.amount_usd) || 0;
    const khr = Number(form.amount_khr) || 0;
    if (usd <= 0 && khr <= 0) return setError(t.expenseAmountRequiredMsg);

    onSubmit({
      title: form.title.trim(),
      category: form.category,
      amount_usd: usd,
      amount_khr: khr,
      expense_date: form.expense_date,
      note: form.note || null,
    });
  };

  return (
    <div
      style={{
        ...glassCard,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: 24,
          padding: 24,
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            {editExpense ? (
              <Edit size={28} color="white" variant="Linear" />
            ) : (
              <MoneyRemove size={28} color="white" variant="Linear" />
            )}
            <h2 style={{ color: colors.whiteFull, margin: 0, fontSize: "1.4rem", fontWeight: 600 }}>
              {editExpense ? t.editExpenseTitle : t.newExpenseAction}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              width: 36,
              height: 36,
              borderRadius: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(231,76,60,0.2)",
              border: "1px solid rgba(231,76,60,0.4)",
              color: "#ff6b6b",
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>{t.expenseTitleLabel}</label>
          <div style={{ position: "relative" }}>
            <Tag size={20} color="white" variant="Linear" style={iconStyle("title")} />
            <input
              style={{ ...inputStyle, paddingLeft: 40, ...borderFor("title") }}
              placeholder={t.expenseTitlePlaceholder}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>{t.expenseCategoryLabel}</label>
            <div style={{ position: "relative" }}>
              <Category size={20} color="white" variant="Linear" style={iconStyle("category")} />
              <select
                style={{ ...inputStyle, paddingLeft: 40, cursor: "pointer", ...borderFor("category") }}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField("")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#2c3e50" }}>
                    {t[`expenseCategory_${c}`] || c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t.expenseDateLabel}</label>
            <div style={{ position: "relative" }}>
              <Calendar size={20} color="white" variant="Linear" style={iconStyle("date")} />
              <input
                type="date"
                style={{ ...inputStyle, paddingLeft: 40, colorScheme: "dark", ...borderFor("date") }}
                value={form.expense_date}
                onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                onFocus={() => setFocusedField("date")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>{t.expenseAmountUsdLabel}</label>
            <div style={{ position: "relative" }}>
              <DollarCircle size={20} color="white" variant="Linear" style={iconStyle("usd")} />
              <input
                type="number"
                min="0"
                step="0.01"
                style={{ ...inputStyle, paddingLeft: 40, ...borderFor("usd") }}
                placeholder="0.00"
                value={form.amount_usd}
                onChange={(e) => setForm({ ...form, amount_usd: e.target.value })}
                onFocus={() => setFocusedField("usd")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t.expenseAmountKhrLabel}</label>
            <input
              type="number"
              min="0"
              step="1"
              style={{ ...inputStyle, ...borderFor("khr") }}
              placeholder="0"
              value={form.amount_khr}
              onChange={(e) => setForm({ ...form, amount_khr: e.target.value })}
              onFocus={() => setFocusedField("khr")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>{t.restockNoteLabel}</label>
          <div style={{ position: "relative" }}>
            <NoteText
              size={18}
              color="white"
              variant="Linear"
              style={{ ...iconStyle("note"), top: 14, transform: "none" }}
            />
            <textarea
              style={{ ...inputStyle, paddingLeft: 40, resize: "vertical", minHeight: 70, ...borderFor("note") }}
              placeholder={t.restockNotePlaceholder}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              onFocus={() => setFocusedField("note")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => !submitting && onClose()}
            className="btn-cancel-glass"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              color: "white",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={() => !submitting && handleSubmit()}
            className="btn-shine-blue"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.9rem",
              opacity: submitting ? 0.8 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            {editExpense ? (
              <TickCircle size="20" color="#fff" variant="outline" />
            ) : (
              <AddCircle size="20" color="#fff" variant="outline" />
            )}
            {submitting ? t.savingAction : editExpense ? t.saveAction : t.createAction}
          </button>
        </div>
      </div>
    </div>
  );
}
