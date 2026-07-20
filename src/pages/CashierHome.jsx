import { useState, useEffect } from "react";
import {
  Grid3,
  ReceiptAdd,
  TickCircle,
  CloseCircle,
  Clock,
  ArrowSwapHorizontal,
} from "iconsax-react";
import CashierLayout from "../components/layout/CashierLayout";
import { glassCard } from "../utils/styles";
import { TABLE_STATUS_STYLES } from "../constants/tableStatus";
import useTables from "../hooks/useTables";
import TableCard from "../components/tables/tableCard";
import SkeletonTable from "../components/ui/SkeletonTable";
import POSModal from "../components/orders/POSModal";
import ToastNotification from "../components/orders/ToastNotification";
import { useOrders, useProducts, usePaymentMethods } from "../hooks/useOrders";
import { useCategories } from "../hooks/useCategories";
import { usePromotions } from "../hooks/usePromotions";
import { usePOS } from "../hooks/usePOS";
import { useTranslations } from "../hooks/useTranslations";
import { printReceipt } from "../components/receipt/ReceiptTemplate";

function CashierHome() {
  const { t } = useTranslations();
  const {
    tables,
    loading: tablesLoading,
    handleClear,
    handleMove,
  } = useTables(t);
  const { products, refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const { promotions } = usePromotions();
  const { toasts, addToast, removeToast, lastOrderId, fetchOrders } =
    useOrders();

  const [initialTableId, setInitialTableId] = useState(null);

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [isMoveMounted, setIsMoveMounted] = useState(false);
  const [isMoveVisible, setIsMoveVisible] = useState(false);
  const [moveTable, setMoveTable] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [moveLoading, setMoveLoading] = useState(false);

  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [isClearMounted, setIsClearMounted] = useState(false);
  const [isClearVisible, setIsClearVisible] = useState(false);
  const [clearTable, setClearTable] = useState(null);
  const [clearLoading, setClearLoading] = useState(false);

  const pos = usePOS({
    onOrderCreated: () => {
      fetchOrders();
      refetchProducts();
    },
    addToast,
    lastOrderId,
    promotions,
    paymentMethods,
  });

  const openTableOrder = (table) => {
    setInitialTableId(table.id);

    const heldOrder =
      table.current_order?.status === "pending" ? table.current_order : null;

    if (heldOrder) {
      // Resume the existing held order - load its items into the cart so
      // the cashier can add more or go straight to checkout, instead of
      // starting a second, unrelated order on the same table.
      pos.loadOrderIntoCart(heldOrder, products);
    } else {
      pos.setOrderType("dine-in");
    }

    pos.setShowPOS(true);
  };

  const openTakeawayOrder = () => {
    setInitialTableId(null);
    pos.setOrderType("takeaway");
    pos.setShowPOS(true);
  };

  const closePOS = () => {
    pos.closePOS();
    setInitialTableId(null);
  };

  useEffect(() => {
    let timeout;
    if (moveModalOpen) {
      setIsMoveMounted(true);
      requestAnimationFrame(() => setIsMoveVisible(true));
    } else {
      setIsMoveVisible(false);
      timeout = setTimeout(() => {
        setIsMoveMounted(false);
        setMoveTable(null);
        setSelectedTargetId("");
        setMoveLoading(false);
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [moveModalOpen]);

  useEffect(() => {
    let timeout;
    if (clearModalOpen) {
      setIsClearMounted(true);
      requestAnimationFrame(() => setIsClearVisible(true));
    } else {
      setIsClearVisible(false);
      timeout = setTimeout(() => {
        setIsClearMounted(false);
        setClearTable(null);
        setClearLoading(false);
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [clearModalOpen]);

  const availableTargets = moveTable
    ? tables.filter((t) => t.id !== moveTable.id && t.status === "available")
    : [];

  const openMoveModal = (table) => {
    const targets = tables.filter(
      (t) => t.id !== table.id && t.status === "available",
    );
    setMoveTable(table);
    setSelectedTargetId(targets[0] ? String(targets[0].id) : "");
    setMoveModalOpen(true);
  };

  const closeMoveModal = () => {
    setMoveModalOpen(false);
  };

  const confirmMove = async () => {
    if (!moveTable || !selectedTargetId) return;
    setMoveLoading(true);
    try {
      await handleMove(moveTable, Number(selectedTargetId));
      closeMoveModal();
    } finally {
      setMoveLoading(false);
    }
  };

  const openClearModal = (table) => {
    setClearTable(table);
    setClearModalOpen(true);
  };

  const closeClearModal = () => {
    setClearModalOpen(false);
  };

  const confirmClear = async () => {
    if (!clearTable) return;
    setClearLoading(true);
    try {
      await handleClear(clearTable);
      closeClearModal();
    } finally {
      setClearLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (moveModalOpen && !moveLoading) closeMoveModal();
      else if (clearModalOpen && !clearLoading) closeClearModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moveModalOpen, moveLoading, clearModalOpen, clearLoading]);

  const availableCount = tables.filter((t) => t.status === "available").length;
  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  const stats = [
    {
      label: t.tableStatAvailable,
      value: availableCount,
      color: "#2ecc71",
      StatIcon: TickCircle,
    },
    {
      label: t.tableStatOccupied,
      value: occupiedCount,
      color: "#e74c3c",
      StatIcon: CloseCircle,
    },
    {
      label: t.tableStatReserved,
      value: reservedCount,
      color: "#f1c40f",
      StatIcon: Clock,
    },
  ];

  return (
    <CashierLayout>
      <style>
        {`
          @keyframes confirm-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes confirm-pop {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes cashier-spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <ToastNotification
        toasts={toasts}
        onClose={removeToast}
        onPrint={printReceipt}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-white font-bold text-2xl m-0 flex items-center gap-3">
          <Grid3 size={32} color="white" variant="Linear" />
          {t.selectATable}
        </h2>
        <button
          onClick={openTakeawayOrder}
          className="btn-shine-blue flex items-center gap-2 px-5 py-3 rounded-[12px] font-semibold text-sm"
        >
          <ReceiptAdd size={22} color="#fff" variant="bulk" />
          {t.newTakeawayOrder}
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        {stats.map((stat) => {
          const IconComponent = stat.StatIcon;
          return (
            <div
              key={stat.label}
              style={{ ...glassCard, flex: "1 1 160px" }}
              className="rounded-[16px] px-6 py-5 flex justify-between items-center"
            >
              <div>
                <div
                  style={{ color: stat.color }}
                  className="text-[0.72rem] font-bold tracking-[1.5px] uppercase mb-2"
                >
                  {stat.label}
                </div>
                <div className="flex items-baseline gap-[6px]">
                  <span
                    style={{ color: stat.color }}
                    className="text-[2rem] font-extrabold"
                  >
                    {stat.value}
                  </span>
                  <span className="text-white/40 text-[0.85rem]">{t.tableStatUnit}</span>
                </div>
              </div>
              <IconComponent
                size="48"
                color={stat.color}
                variant="bulk"
                style={{ opacity: 0.8 }}
              />
            </div>
          );
        })}
      </div>

      {tablesLoading ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonTable key={index} delay={index * 0.05} />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div style={glassCard} className="rounded-[20px] p-[60px] text-center">
          <div className="flex justify-center mb-4">
            <Grid3 size={60} color="white" variant="TwoTone" />
          </div>
          <p className="text-white/50 text-base">
            {t.noTablesSetup}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              statusStyle={
                TABLE_STATUS_STYLES[table.status] ||
                TABLE_STATUS_STYLES.available
              }
              readOnly
              onSelect={openTableOrder}
              onClear={openClearModal}
              onOpenMove={openMoveModal}
              t={t}
            />
          ))}
        </div>
      )}

      {pos.showPOS && (
        <POSModal
          products={products}
          categories={categories}
          paymentMethods={paymentMethods}
          promotions={promotions}
          initialTableId={initialTableId}
          {...pos}
          closePOS={closePOS}
        />
      )}

      {isMoveMounted && (
        <div
          style={{
            ...glassCard,
            opacity: isMoveVisible ? 1 : 0,
            animation: isMoveVisible
              ? "confirm-fade-in 0.2s ease forwards"
              : "none",
            transition: "opacity 220ms ease",
            pointerEvents: isMoveVisible ? "auto" : "none",
          }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !moveLoading) closeMoveModal();
          }}
        >
          <div
            style={{
              ...glassCard,
              transform: isMoveVisible ? "translateY(0)" : "translateY(24px)",
              opacity: isMoveVisible ? 1 : 0,
              animation: isMoveVisible
                ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "none",
              transition: "transform 220ms ease, opacity 220ms ease",
            }}
            className="w-full max-w-[440px] rounded-[24px] p-7 text-white border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[#8b5cf6] text-[0.74rem] font-bold uppercase tracking-[1.6px] mb-1.5">
                  {t.tableTransfer}
                </div>
                <h3 className="text-[1.3rem] font-bold m-0">
                  {t.moveTableModalTitle} {moveTable?.name}
                </h3>
              </div>
              <button
                onClick={closeMoveModal}
                aria-label={t.cancel}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/10 text-white cursor-pointer flex items-center justify-center text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-white/70 leading-relaxed mb-4">
              {t.moveTableDesc}
            </p>

            <div className="rounded-[16px] bg-white/[0.08] border border-white/10 p-3">
              {availableTargets.length === 0 ? (
                <div className="text-white/70 px-1 py-2.5">
                  {t.noAvailableTablesToMove}
                </div>
              ) : (
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full rounded-[14px] border border-white/15 bg-[#0f172a]/75 text-white px-4 py-3.5 text-[0.95rem] outline-none"
                >
                  {availableTargets.map((target) => (
                    <option
                      key={target.id}
                      value={String(target.id)}
                      className="text-[#0f172a]"
                    >
                      {target.name} · {target.capacity} {t.seats}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeMoveModal}
                className="btn-cancel-glass px-5 py-3 rounded-[12px] font-medium text-sm"
                disabled={moveLoading}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmMove}
                disabled={moveLoading || availableTargets.length === 0}
                className="btn-shine-blue flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {moveLoading ? (
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2.5px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "cashier-spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <ArrowSwapHorizontal
                    size={18}
                    color="#fff"
                    variant="Linear"
                  />
                )}
                {moveLoading ? t.moving : t.confirmMove}
              </button>
            </div>
          </div>
        </div>
      )}

      {isClearMounted && (
        <div
          style={{
            ...glassCard,
            opacity: isClearVisible ? 1 : 0,
            animation: isClearVisible
              ? "confirm-fade-in 0.2s ease forwards"
              : "none",
            transition: "opacity 220ms ease",
            pointerEvents: isClearVisible ? "auto" : "none",
          }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !clearLoading) closeClearModal();
          }}
        >
          <div
            style={{
              ...glassCard,
              transform: isClearVisible ? "translateY(0)" : "translateY(24px)",
              opacity: isClearVisible ? 1 : 0,
              animation: isClearVisible
                ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "none",
              transition: "transform 220ms ease, opacity 220ms ease",
            }}
            className="w-full max-w-[420px] rounded-[24px] p-7 text-white border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[#f59e0b] text-[0.74rem] font-bold uppercase tracking-[1.6px] mb-1.5">
                  {t.checkoutTable}
                </div>
                <h3 className="text-[1.3rem] font-bold m-0">
                  {t.clearTableModalTitle} {clearTable?.name}?
                </h3>
              </div>
              <button
                onClick={closeClearModal}
                aria-label={t.cancel}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/10 text-white cursor-pointer flex items-center justify-center text-base"
              >
                ✕
              </button>
            </div>

            <p className="text-white/70 leading-relaxed mb-5">
              {t.clearTableDesc}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeClearModal}
                className="btn-cancel-glass px-5 py-3 rounded-[12px] font-medium text-sm"
                disabled={clearLoading}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmClear}
                disabled={clearLoading}
                className="btn-shine-blue flex items-center justify-center gap-2 px-5 py-3 rounded-[12px] font-semibold text-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {clearLoading ? (
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2.5px solid rgba(255,255,255,0.35)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "cashier-spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <TickCircle size={20} color="#fff" variant="Outline" />
                )}
                {clearLoading ? t.clearing : t.confirmClear}
              </button>
            </div>
          </div>
        </div>
      )}
    </CashierLayout>
  );
}

export default CashierHome;
