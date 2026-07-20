import Layout from "../components/layout/Layout";
import { ReceiptItem } from "iconsax-react";
import { useStockHistory } from "../hooks/useStockHistory";
import { StockHistoryFilters } from "../components/stockHistory/StockHistoryFilters";
import { StockHistoryTable } from "../components/stockHistory/StockHistoryTable";
import { useTranslations } from "../hooks/useTranslations";

function StockHistory() {
  const { t } = useTranslations();
  const {
    logs,
    loading,
    search,
    setSearch,
    actionFilter,
    handleActionFilter,
    page,
    setPage,
    lastPage,
    total,
  } = useStockHistory();

  return (
    <Layout>
      <style>
        {`
          @keyframes float {
            0%   { transform: translateY(0px); }
            50%  { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          .floating-wrapper {
            line-height: 0;
            flex-shrink: 0;
            display: flex;
            align-items: center;
          }
          .floating-wrapper img {
            display: block;
            animation: float 2s ease-in-out infinite;
            transform-origin: center center;
            transform: translateZ(0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            -webkit-font-smoothing: antialiased;
            filter: blur(0px);
          }
          .modal-icon {
            width: 40px;
            height: 40px;
            display: block;
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
          <ReceiptItem
            size="35"
            color="#fff"
            variant="bulk"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          {t.stockHistoryTitle}
        </h2>
      </div>

      <StockHistoryFilters
        search={search}
        onSearch={setSearch}
        actionFilter={actionFilter}
        onActionFilter={handleActionFilter}
        t={t}
      />

      <StockHistoryTable logs={logs} loading={loading} page={page} t={t} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          {t.totalRecordsCountMsg.replace("{n}", total)}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === 1 ? "not-allowed" : "pointer",
              background:
                page === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
              color: page === 1 ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {t.paginationBackAction}
          </button>
          <span
            style={{
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              padding: "0 8px",
            }}
          >
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === lastPage ? "not-allowed" : "pointer",
              background:
                page === lastPage
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color: page === lastPage ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default StockHistory;
