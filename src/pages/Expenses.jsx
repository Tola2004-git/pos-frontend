import { useEffect, useRef, useState } from "react";
import { Add, MoneyRemove, Edit, Trash, SearchNormal1 } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glass, glassCard, accentBorder } from "../utils/styles";
import { useExpenses } from "../hooks/useExpenses";
import { useTranslations } from "../hooks/useTranslations";
import ExpenseModal from "../components/expenses/ExpenseModal";
import { SkeletonExpenseTable } from "../components/ui/SkeletonExpense";
import { Tooltip } from "../components/ui/Tooltip";

const CATEGORIES = [
  "all",
  "rent",
  "utilities",
  "salary",
  "supplies",
  "maintenance",
  "other",
];

function fmtDate(v) {
  return v ? new Date(v).toLocaleDateString() : "—";
}
function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}
function fmtKhr(v) {
  const n = Number(v) || 0;
  return n > 0 ? `៛${n.toLocaleString()}` : "—";
}

function Expenses() {
  const { t } = useTranslations();
  const {
    expenses,
    loading,
    page,
    setPage,
    lastPage,
    total,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    deletingId,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const categoryDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const openCreate = () => {
    setEditExpense(null);
    setShowModal(true);
  };
  const openEdit = (expense) => {
    setEditExpense(expense);
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setEditExpense(null);
  };
  const handleSubmit = async (payload) => {
    setSubmitting(true);
    const result = editExpense
      ? await updateExpense(editExpense.id, payload)
      : await createExpense(payload);
    setSubmitting(false);
    if (result.success) handleClose();
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <MoneyRemove
            size="35"
            color="currentColor"
            variant="Outline"
            className="text-white"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          <h2 className="text-white font-bold text-2xl m-0">{t.expenses}</h2>
        </div>
        <button
          onClick={openCreate}
          className="btn-shine-blue px-4 py-2.5 rounded-[12px] text-sm font-semibold flex items-center gap-2"
        >
          <Add size={22} color="white" variant="Linear" />
          {t.newExpenseAction}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div
          style={{
            ...glass,
            borderRadius: "16px",
            padding: "14px 16px",
            flex: 1,
            minWidth: "200px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <SearchNormal1 size={20} color="currentColor" variant="Linear" className="text-white" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.expenseSearchPlaceholder}
            style={{
              border: "none",
              background: "transparent",
              padding: "0",
              flex: 1,
              color: "var(--accent-border-full)",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        <div ref={categoryDropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            style={{
              ...glassCard,
              padding: "14px 18px",
              borderRadius: "16px",
              cursor: "pointer",
              color: "var(--accent-border-full)",
              fontWeight: 600,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            {categoryFilter === "all"
              ? t.allLabel
              : t[`expenseCategory_${categoryFilter}`] || categoryFilter}
            <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
              {showCategoryFilter ? "▲" : "▼"}
            </span>
          </button>

          <style>{`
            @keyframes dropdownFade {
              from { opacity: 0; transform: scale(0.95) translateY(-5px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {showCategoryFilter && (
            <div
              style={{
                ...glassCard,
                position: "absolute",
                top: "110%",
                right: 0,
                borderRadius: "14px",
                zIndex: 99999,
                minWidth: "180px",
                boxShadow: "0 15px 40px var(--popover-shadow-color)",
                overflow: "hidden",
                animation: "dropdownFade 0.2s ease",
                transformOrigin: "top right",
              }}
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategoryFilter(c);
                    setShowCategoryFilter(false);
                    setPage(1);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "11px 16px",
                    background:
                      categoryFilter === c
                        ? "var(--surface-tint-15)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color:
                      categoryFilter === c
                        ? accentBorder.full
                        : accentBorder.soft,
                    fontSize: "0.88rem",
                    fontWeight: categoryFilter === c ? 700 : 400,
                    borderLeft:
                      categoryFilter === c
                        ? `3px solid ${accentBorder.full}`
                        : "3px solid transparent",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-tint-12)";
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      categoryFilter === c
                        ? "var(--surface-tint-15)"
                        : "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {c === "all" ? t.allLabel : t[`expenseCategory_${c}`] || c}
                  {categoryFilter === c && (
                    <span style={{ marginLeft: "auto" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
                  
      <div
        style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}
        className="mb-4"
      >
        <div className="w-full overflow-x-auto table-scroll-x">
          <table className="w-full text-sm" style={{ minWidth: "800px" }}>
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  "#",
                  t.expenseColTitle,
                  t.expenseColCategory,
                  t.expenseColAmount,
                  t.expenseColDate,
                  t.expenseColRecordedBy,
                  t.productColActions,
                ].map((h, i) => (
                  <th
                    key={h || `col-${i}`}
                    style={{ color: accentBorder.full }}
                    className="font-semibold px-4 py-3.5 text-[0.82rem] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonExpenseTable rows={8} />
              ) : expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    {t.expenseNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                expenses.map((exp, index) => (
                  <tr
                    key={exp.id}
                    className="border-b border-white/5 text-white/85"
                  >
                    <td className="px-4 py-3.5 text-white/50 whitespace-nowrap">
                      {(page - 1) * 15 + index + 1}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {exp.title}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#3498db",
                          border: "1px solid #3498db",
                        }}
                      >
                        {t[`expenseCategory_${exp.category}`] || exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {Number(exp.amount_usd) > 0 && fmtUsd(exp.amount_usd)}
                      {Number(exp.amount_usd) > 0 &&
                        Number(exp.amount_khr) > 0 && (
                          <span className="text-white/50"> / </span>
                        )}
                      {Number(exp.amount_khr) > 0 && fmtKhr(exp.amount_khr)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDate(exp.expense_date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-white/70">
                      {exp.user?.name || t.naLabel}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex gap-2 justify-start">
                        <Tooltip label={t.editAction}>
                          <button
                            onClick={() => openEdit(exp)}
                            className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer hover:scale-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            <Edit size="18" color="currentColor" variant="Linear" className="text-white" />
                          </button>
                        </Tooltip>
                        <Tooltip label={t.deleteAction}>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            disabled={deletingId === exp.id}
                            className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer hover:scale-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {deletingId === exp.id ? (
                              <svg
                                className="animate-spin"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                              >
                                <circle
                                  cx="9"
                                  cy="9"
                                  r="7"
                                  stroke="var(--surface-border)"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M9 2 A7 7 0 0 1 16 9"
                                  stroke="var(--accent-border-full)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <Trash size="18" color="currentColor" variant="Linear" className="text-white" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <span className="text-white/50 text-sm">
          {t.expenseTotalCountMsg.replace("{n}", total)}
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={page === 1 ? { background: "var(--surface-tint-08)" } : undefined}
            className={`px-4 py-2 rounded-[10px] border text-sm font-semibold transition-colors ${
              page === 1
                ? "text-white/30 border-white/10 cursor-not-allowed"
                : "bg-white/10 text-white border-white/15"
            }`}
          >
            {t.paginationBackAction}
          </button>
          <span className="text-white text-sm font-semibold px-2">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            style={page === lastPage ? { background: "var(--surface-tint-08)" } : undefined}
            className={`px-4 py-2 rounded-[10px] border text-sm font-semibold transition-colors ${
              page === lastPage
                ? "text-white/30 border-white/10 cursor-not-allowed"
                : "bg-white/10 text-white border-white/15"
            }`}
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>

      <ExpenseModal
        show={showModal}
        onClose={handleClose}
        editExpense={editExpense}
        submitting={submitting}
        onSubmit={handleSubmit}
        t={t}
      />
    </Layout>
  );
}

export default Expenses;
