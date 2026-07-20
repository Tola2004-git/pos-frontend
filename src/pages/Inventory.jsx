import Layout from "../components/layout/Layout";
import { glass, glassCard, colors } from "../utils/styles";
import { useInventory } from "../hooks/useInventory";
import { getStockStatus } from "../utils/stockHelpers";
import ThresholdSetting from "../components/inventory/ThresholdSetting";
import StockFilterDropdown from "../components/inventory/StockFilterDropdown";
import InventoryTable from "../components/inventory/InventoryTable";
import RestockModal from "../components/inventory/RestockModal";

import { BoxRemove, BoxSearch, BoxTick, Box, Refresh2, SearchNormal1 } from "iconsax-react";
import { useTranslations } from "../hooks/useTranslations";

function Inventory() {
  const { t } = useTranslations();
  const inv = useInventory();

  const STAT_CARDS = [
    {
      key: "in_stock",
      label: t.statInStockLabel,
      color: "#2ecc71",
      StatIcon: BoxTick,
    },
    {
      key: "low_stock",
      label: t.statLowStockLabel,
      color: "#f1c40f",
      StatIcon: BoxSearch,
    },
    {
      key: "out_of_stock",
      label: t.statOutOfStockLabel,
      color: "#e74c3c",
      StatIcon: BoxRemove,
    },
  ];

  const filteredProducts = inv.allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(inv.restockSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(inv.restockSearch.toLowerCase())),
  );

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

      {/* Header */}
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
          <div className="floating-wrapper">
            <Box
              size="40"
              color="#fff"
              variant="bulk"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
          </div>
          {t.inventoryManagementTitle}
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <ThresholdSetting
            thresholdRef={inv.thresholdRef}
            threshold={inv.threshold}
            showThreshold={inv.showThreshold}
            setShowThreshold={inv.setShowThreshold}
            tempThreshold={inv.tempThreshold}
            setTempThreshold={inv.setTempThreshold}
            saveThreshold={inv.saveThreshold}
            t={t}
          />
          <button
            onClick={() => inv.openRestock()}
            className="btn-shine-blue"
            style={{
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              gap: "8px",
              fontSize: "0.9rem",
            }}
          >
            <Refresh2 size="20" color="#fff" variant="bulk" />
            {t.restockAction}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        {STAT_CARDS.map((s) => {
          const IconComponent = s.StatIcon;
          const count = inv.allProducts.filter((p) =>
            s.key === "in_stock"
              ? p.qty > inv.threshold
              : s.key === "low_stock"
                ? p.qty > 0 && p.qty <= inv.threshold
                : p.qty <= 0,
          ).length;
          return (
            <div
              key={s.key}
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
                    color: s.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
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
                      color: s.color,
                      fontSize: "2rem",
                      fontWeight: 800,
                    }}
                  >
                    {count}
                  </span>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "0.82rem",
                    }}
                  >
                    {t.itemsUnitLabel}
                  </span>
                </div>
              </div>
              <IconComponent
                size="60"
                color={s.color}
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

      {/* Search + Filter */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            ...glass,
            borderRadius: "16px",
            padding: "14px 16px",
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <SearchNormal1 size="20" color="#fff" variant="linear" />
          <input
            type="text"
            placeholder={t.searchInventoryPlaceholder}
            value={inv.search}
            onChange={(e) => {
              inv.setSearch(e.target.value);
              inv.setPage(1);
            }}
            style={{
              border: "none",
              background: "transparent",
              padding: "0",
              flex: 1,
              color: "white",
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>
        <StockFilterDropdown
          stockDropdownRef={inv.stockDropdownRef}
          stockFilter={inv.stockFilter}
          setStockFilter={inv.setStockFilter}
          setPage={inv.setPage}
          showFilterDropdown={inv.showFilterDropdown}
          setShowFilterDropdown={inv.setShowFilterDropdown}
          t={t}
        />
      </div>

      {/* Table */}
      <InventoryTable
        products={inv.products}
        loading={inv.loading}
        page={inv.page}
        threshold={inv.threshold}
        openRestock={inv.openRestock}
        t={t}
      />

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          {t.totalProductsCountMsg.replace("{n}", inv.total)}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => inv.setPage((p) => Math.max(1, p - 1))}
            disabled={inv.page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: inv.page === 1 ? "not-allowed" : "pointer",
              background:
                inv.page === 1
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color: inv.page === 1 ? "rgba(255,255,255,0.3)" : "white",
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
            {inv.page} / {inv.lastPage}
          </span>
          <button
            onClick={() => inv.setPage((p) => Math.min(inv.lastPage, p + 1))}
            disabled={inv.page === inv.lastPage}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: inv.page === inv.lastPage ? "not-allowed" : "pointer",
              background:
                inv.page === inv.lastPage
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color:
                inv.page === inv.lastPage ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>

      {/* Restock Modal */}
      <RestockModal
        loadingRestock={inv.loadingRestock}
        showRestock={inv.showRestock}
        restockDropdownRef={inv.restockDropdownRef}
        restockSearch={inv.restockSearch}
        setRestockSearch={inv.setRestockSearch}
        setRestockForm={inv.setRestockForm}
        setSelectedProduct={inv.setSelectedProduct}
        showDropdown={inv.showDropdown}
        setShowDropdown={inv.setShowDropdown}
        filteredProducts={filteredProducts}
        handleSelectProduct={inv.handleSelectProduct}
        selectedProduct={inv.selectedProduct}
        threshold={inv.threshold}
        restockForm={inv.restockForm}
        restockError={inv.restockError}
        submitting={inv.submitting}
        handleRestock={inv.handleRestock}
        closeRestock={inv.closeRestock}
        t={t}
      />
    </Layout>
  );
}

export default Inventory;
