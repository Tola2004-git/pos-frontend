import { useState } from "react";
import Layout from "../components/layout/Layout";
import { glass, glassCard } from "../utils/styles";
import { useIngredients } from "../hooks/useIngredients";
import { useCategories } from "../hooks/useCategories";
import IngredientsTable from "../components/ingredients/IngredientsTable";
import IngredientModal from "../components/ingredients/IngredientModal";
import RestockModal from "../components/ingredients/RestockModal";
import StockFilterDropdown from "../components/inventory/StockFilterDropdown";
import CategoryModal from "../components/products/CategoryModal";
import {
  Add,
  Cake,
  BoxTick,
  BoxSearch,
  BoxRemove,
  SearchNormal1,
  Category,
} from "iconsax-react";
import { useTranslations } from "../hooks/useTranslations";

function Ingredients() {
  const { t } = useTranslations();
  const ing = useIngredients();

  const STAT_CARDS = [
    { key: "in_stock",
      label: t.statInStockLabel,
      color: "#2ecc71",
      StatIcon: BoxTick },
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
  const {
    categories,
    catLoading,
    editCat,
    setEditCat,
    catForm,
    setCatForm,
    catError,
    catSubmitting,
    handleCatSubmit,
    handleCatDelete,
    toggleCatStatus,
    resetCatForm,
  } = useCategories("ingredient");

  const [showModal, setShowModal] = useState(false);
  const [editIngredient, setEditIngredient] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showCatModal, setShowCatModal] = useState(false);
  const [catModalLoading, setCatModalLoading] = useState(false);

  const handleAdd = () => {
    setEditIngredient(null);
    setModalLoading(false);
    setShowModal(true);
  };

  const handleEdit = async (ingredient) => {
    setEditIngredient(ingredient);
    setModalLoading(true);
    setShowModal(true);
    await new Promise((r) => setTimeout(r, 400));
    setModalLoading(false);
  };

  const handleOpenCatModal = async () => {
    setCatModalLoading(true);
    setShowCatModal(true);
    await new Promise((r) => setTimeout(r, 600));
    setCatModalLoading(false);
  };

  const handleCloseCatModal = () => {
    setShowCatModal(false);
    resetCatForm();
  };

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Cake size={40} color="white" variant="Outline" />
          </div>
          {t.ingredientsManagementTitle}
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleOpenCatModal}
            style={{
              ...glassCard,
              padding: "10px 18px",
              borderRadius: "12px",
              fontWeight: 600,
              cursor: "pointer",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
            }}
          >
            <Category size={20} color="white" variant="Linear" />
            {t.categoriesAction}
          </button>
          <button
            onClick={handleAdd}
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
            <Add size={24} color="white" variant="Linear" />
            {t.addIngredientAction}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        {STAT_CARDS.map((s) => {
          const IconComponent = s.StatIcon;
          const count = ing.allIngredients.filter((i) => {
            const qty = Number(i.quantity);
            const threshold = Number(i.low_stock_threshold);
            return s.key === "in_stock"
              ? qty > threshold
              : s.key === "low_stock"
                ? qty > 0 && qty <= threshold
                : qty <= 0;
          }).length;
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
                    {t.ingredientsUnitLabel}
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
            placeholder={t.searchIngredientsPlaceholder}
            value={ing.search}
            onChange={(e) => {
              ing.setSearch(e.target.value);
              ing.setPage(1);
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
          stockDropdownRef={ing.stockDropdownRef}
          stockFilter={ing.stockFilter}
          setStockFilter={ing.setStockFilter}
          setPage={ing.setPage}
          showFilterDropdown={ing.showFilterDropdown}
          setShowFilterDropdown={ing.setShowFilterDropdown}
          t={t}
        />
      </div>

      {/* Table */}
      <IngredientsTable
        ingredients={ing.ingredients}
        loading={ing.loading}
        page={ing.page}
        onEdit={handleEdit}
        onDelete={ing.handleDelete}
        onRestock={ing.openRestock}
        t={t}
      />

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          padding: "0 4px",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          {t.totalIngredientsCountMsg.replace("{n}", ing.total)}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => ing.setPage((p) => Math.max(1, p - 1))}
            disabled={ing.page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: ing.page === 1 ? "not-allowed" : "pointer",
              background:
                ing.page === 1
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color: ing.page === 1 ? "rgba(255,255,255,0.3)" : "white",
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
            {ing.page} / {ing.lastPage}
          </span>
          <button
            onClick={() => ing.setPage((p) => Math.min(ing.lastPage, p + 1))}
            disabled={ing.page === ing.lastPage}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: ing.page === ing.lastPage ? "not-allowed" : "pointer",
              background:
                ing.page === ing.lastPage
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color:
                ing.page === ing.lastPage ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>

      {showModal && (
        <IngredientModal
          editIngredient={editIngredient}
          categories={categories}
          modalLoading={modalLoading}
          onClose={() => {
            setShowModal(false);
            setEditIngredient(null);
          }}
          onSuccess={() => {
            ing.fetchIngredients();
            ing.fetchAllIngredients();
          }}
          t={t}
        />
      )}

      <RestockModal
        showRestock={ing.showRestock}
        selectedIngredient={ing.selectedIngredient}
        restockForm={ing.restockForm}
        setRestockForm={ing.setRestockForm}
        restockError={ing.restockError}
        submitting={ing.submitting}
        handleRestock={ing.handleRestock}
        closeRestock={ing.closeRestock}
        t={t}
      />

      {showCatModal && (
        <CategoryModal
          categories={categories}
          catLoading={catLoading}
          catModalLoading={catModalLoading}
          editCat={editCat}
          setEditCat={setEditCat}
          catForm={catForm}
          setCatForm={setCatForm}
          catError={catError}
          catSubmitting={catSubmitting}
          onSubmit={handleCatSubmit}
          onDelete={handleCatDelete}
          onToggleStatus={toggleCatStatus}
          onClose={handleCloseCatModal}
          resetCatForm={resetCatForm}
          t={t}
        />
      )}
    </Layout>
  );
}

export default Ingredients;
