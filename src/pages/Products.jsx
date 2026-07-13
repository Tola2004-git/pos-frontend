import { useState } from "react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import ProductSearch from "../components/products/ProductSearch";
import ProductTable from "../components/products/ProductTable";
import ProductModal from "../components/products/ProductModal";
import CategoryModal from "../components/products/CategoryModal";
import { Add, Box, Category } from "iconsax-react";

function Products() {
  const {
    products,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    lastPage,
    total,
    fetchProducts,
    handleDelete,
  } = useProducts();

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
  } = useCategories("product");

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [showCatModal, setShowCatModal] = useState(false);
  const [catModalLoading, setCatModalLoading] = useState(false);

  const handleAddProduct = () => {
    setEditProduct(null);
    setModalLoading(false);
    setShowModal(true);
  };

  const handleEdit = async (product) => {
    setEditProduct(product);
    setModalLoading(true);
    setShowModal(true);
    await new Promise((r) => setTimeout(r, 600));
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
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
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
            <Box size={40} color="white" variant="Linear" />
          </div>
          Products Management
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
            Categories
          </button>
          <button
            onClick={handleAddProduct}
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
            Add Product
          </button>
        </div>
      </div>

      <ProductSearch
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        setPage={setPage}
      />

      <ProductTable
        products={products}
        loading={loading}
        page={page}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
          Total: {total} products
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
            Back
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
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <ProductModal
          editProduct={editProduct}
          categories={categories}
          modalLoading={modalLoading}
          onClose={() => {
            setShowModal(false);
            setEditProduct(null);
          }}
          onSuccess={fetchProducts}
        />
      )}

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
        />
      )}
    </Layout>
  );
}

export default Products;
