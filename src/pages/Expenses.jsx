import { useState } from "react";
import { Add, MoneyRemove, Edit, Trash } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useExpenses } from "../hooks/useExpenses";
import { useTranslations } from "../hooks/useTranslations";
import ExpenseModal from "../components/expenses/ExpenseModal";

const CATEGORIES = ["all", "rent", "utilities", "salary", "supplies", "maintenance", "other"];

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
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
            color="#fff"
            variant="Outline"
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
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t.expenseSearchPlaceholder}
          className="rounded-[10px] border border-white/20 bg-white/10 text-white text-sm py-2.5 px-4 outline-none flex-1 min-w-[200px]"
        />
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-[10px] border border-white/20 bg-white/10 text-white text-sm py-2.5 px-4 outline-none cursor-pointer"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} style={{ background: "#2c3e50" }}>
              {c === "all" ? t.allLabel : t[`expenseCategory_${c}`] || c}
            </option>
          ))}
        </select>
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
                  t.expenseColTitle,
                  t.expenseColCategory,
                  t.expenseColAmount,
                  t.expenseColDate,
                  t.expenseColRecordedBy,
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{ color: colors.whiteFull }}
                    className="font-semibold px-4 py-3.5 text-[0.82rem] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                    {t.loadingMsg}
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                    {t.expenseNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-white/5 text-white/85">
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
                      {fmtUsd(exp.amount_usd)}
                      {Number(exp.amount_khr) > 0 && (
                        <span className="text-white/50"> / {fmtKhr(exp.amount_khr)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{fmtDate(exp.expense_date)}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-white/70">
                      {exp.user?.name || t.naLabel}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(exp)}
                          className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Edit size="18" color="#fff" variant="Linear" />
                        </button>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1.5 rounded-lg border-none bg-transparent cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Trash size="18" color="#fff" variant="Linear" />
                        </button>
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
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
          >
            {t.paginationBackAction}
          </button>
          <span className="text-white text-sm font-semibold px-2">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
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
