import { useContext, useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { SidebarContext } from "../App";
import { glass, glassCard, colors } from "../utils/styles";
import { TABLE_STATUS_STYLES } from "../constants/tableStatus";
import useTables from "../hooks/useTables";
import TableCard from "../components/tables/tableCard";
import TableModal from "../components/tables/tableModal";
import {
  AddCircle,
  Grid3,
  TickCircle,
  CloseCircle,
  Clock,
  ClipboardText,
} from "iconsax-react";
import SkeletonTable from "../components/ui/SkeletonTable";
import { useTranslations } from "../hooks/useTranslations";

function Tables() {
  const { t } = useTranslations();
  const { sidebarOpen } = useContext(SidebarContext);
  const SkeletonCount = sidebarOpen ? 10 : 12;

  const {
    tables,
    loading,
    showModal,
    editTable,
    form,
    modalLoading,
    setForm,
    openAdd,
    openEdit,
    handleSave,
    handleClear,
    handleMove,
    handleDelete,
    setShowModal,
  } = useTables(t);

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

  const availableCount = tables.filter((tbl) => tbl.status === "available").length;
  const occupiedCount = tables.filter((tbl) => tbl.status === "occupied").length;
  const reservedCount = tables.filter((tbl) => tbl.status === "reserved").length;
  const availableTargets = moveTable
    ? tables.filter(
        (candidate) =>
          candidate.id !== moveTable.id && candidate.status === "available",
      )
    : [];

  useEffect(() => {
    if (!moveModalOpen || !moveTable) return;

    if (availableTargets.length === 0) {
      setSelectedTargetId("");
      return;
    }

    if (
      !availableTargets.some(
        (candidate) => String(candidate.id) === String(selectedTargetId),
      )
    ) {
      setSelectedTargetId(String(availableTargets[0].id));
    }
  }, [availableTargets, moveModalOpen, moveTable, selectedTargetId]);

  const openMoveModal = (table) => {
    const targets = tables.filter(
      (candidate) =>
        candidate.id !== table.id && candidate.status === "available",
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
    <Layout>
      <style>
        {`
          @keyframes float {
            0%   { transform: translateY(0px); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          @keyframes confirm-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes confirm-pop {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Grid3 size={40} color="white" variant="Linear" />
          </div>
          {t.tablesPageTitle}
        </h2>
        <button
          onClick={openAdd}
          className="btn-shine-blue"
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AddCircle size={20} color="white" variant="Linear" /> {t.addTableAction}
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        {stats.map((stat) => {
          const IconComponent = stat.StatIcon;
          return (
            <div
              key={stat.label}
              style={{
                ...glassCard,
                flex: 1,
                padding: "20px 24px",
                borderRadius: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: stat.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      color: stat.color,
                      fontSize: "2rem",
                      fontWeight: 800,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.tableStatUnit}
                  </span>
                </div>
              </div>
              <IconComponent
                size="60"
                color={stat.color}
                variant="bulk"
                style={{
                  animation: "float 2s ease-in-out infinite",
                  opacity: 0.8,
                }}
              />
            </div>
          );
        })}
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: SkeletonCount }).map((_, index) => (
            <SkeletonTable key={index} delay={index * 0.05} />
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div
          style={{
            ...glassCard,
            borderRadius: "20px",
            padding: "60px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              marginBottom: "16px",
              justifyContent: "center",
              display: "flex",
            }}
          >
            <Grid3
              size={60}
              color="white"
              variant="TwoTone"
              style={{ animation: "float 2s ease-in-out infinite" }}
            />
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>
            {t.noTablesYetMsg}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
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
              onEdit={openEdit}
              onClear={openClearModal}
              onOpenMove={openMoveModal}
              onDelete={handleDelete}
              t={t}
            />
          ))}
        </div>
      )}

      {isMoveMounted && (
        <div
          style={{
            ...glassCard,
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "24px",
            opacity: isMoveVisible ? 1 : 0,
            animation: isMoveVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
            transition: "opacity 220ms ease",
            pointerEvents: isMoveVisible ? "auto" : "none",
          }}
        >
          <div
            style={{
              ...glassCard,
              width: "100%",
              maxWidth: "480px",
              borderRadius: "24px",
              padding: "28px",
              color: "white",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
              transform: isMoveVisible ? "translateY(0)" : "translateY(24px)",
              opacity: isMoveVisible ? 1 : 0,
              animation: isMoveVisible
                ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "none",
              transition: "transform 220ms ease, opacity 220ms ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#8b5cf6",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  {t.tableTransfer}
                </div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
                  {t.moveTableModalTitle} {moveTable?.name}
                </h3>
              </div>
              <button
                onClick={closeMoveModal}
                aria-label={t.cancel}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            </div>

            <p
              style={{
                margin: "0 0 16px",
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.6,
              }}
            >
              {t.adminMoveTableDesc}
            </p>

            <div
              style={{
                padding: "12px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {availableTargets.length === 0 ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    padding: "10px 4px",
                  }}
                >
                  {t.noAvailableTablesForMove}
                </div>
              ) : (
                <select
                  value={selectedTargetId}
                  onChange={(event) => setSelectedTargetId(event.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(15, 23, 42, 0.75)",
                    color: "white",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                >
                  {availableTargets.map((target) => (
                    <option
                      key={target.id}
                      value={String(target.id)}
                      style={{ color: "#0f172a" }}
                    >
                      {target.name} · {target.capacity} {t.seats}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "22px",
              }}
            >
              <button
                onClick={closeMoveModal}
                className="btn-cancel-glass"
                style={{
                  // flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  color: "white",
                  cursor: modalLoading ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  opacity: modalLoading ? 0.6 : 1,
                }}
                disabled={modalLoading}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmMove}
                disabled={moveLoading || availableTargets.length === 0}
                className="btn-shine-blue"
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: moveLoading || availableTargets.length === 0 ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  opacity: moveLoading || availableTargets.length === 0 ? 0.8 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {moveLoading ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <circle
                        cx="9"
                        cy="9"
                        r="7"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      <path
                        d="M9 2 A7 7 0 0 1 16 9"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {t.moving}
                  </>
                ) : (
                  <>
                    <TickCircle size="22" color="#fff" variant="Outline" />
                    {t.confirmMove}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isClearMounted && (
        <div
          style={{
            ...glassCard,
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "24px",
            opacity: isClearVisible ? 1 : 0,
            animation: isClearVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
            transition: "opacity 220ms ease",
            pointerEvents: isClearVisible ? "auto" : "none",
          }}
        >
          <div
            style={{
              ...glassCard,
              width: "100%",
              maxWidth: "460px",
              borderRadius: "24px",
              padding: "28px",
              color: "white",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
              transform: isClearVisible ? "translateY(0)" : "translateY(24px)",
              opacity: isClearVisible ? 1 : 0,
              animation: isClearVisible
                ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                : "none",
              transition: "transform 220ms ease, opacity 220ms ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#f59e0b",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    letterSpacing: "1.6px",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                  }}
                >
                  {t.checkoutTable}
                </div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
                  {t.clearTableModalTitle} {clearTable?.name}?
                </h3>
              </div>
              <button
                onClick={closeClearModal}
                aria-label={t.cancel}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: "0 0 20px", color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
              {t.adminClearTableDesc}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={closeClearModal}
                className="btn-cancel-glass"
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  color: "white",
                  cursor: clearLoading ? "not-allowed" : "pointer",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  opacity: clearLoading ? 0.6 : 1,
                }}
                disabled={clearLoading}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmClear}
                disabled={clearLoading}
                className="btn-shine-blue"
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: clearLoading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  opacity: clearLoading ? 0.8 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {clearLoading ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <circle
                        cx="9"
                        cy="9"
                        r="7"
                        fill="none"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                      />
                      <path
                        d="M9 2 A7 7 0 0 1 16 9"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {t.clearing}
                  </>
                ) : (
                  <>
                    <TickCircle size="22" color="#fff" variant="Outline" />
                    {t.confirmClear}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <TableModal
        showModal={showModal}
        editTable={editTable}
        form={form}
        setForm={setForm}
        modalLoading={modalLoading}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        t={t}
      />
    </Layout>
  );
}

export default Tables;
