import { useState, useRef, useEffect } from "react";
import Layout from "../components/layout/Layout.jsx";
import { usePromotions } from "../hooks/usePromotions.js";
import { Add, TicketDiscount } from "iconsax-react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import PromotionFilter from "../components/promotions/PromotionFilter.jsx";
import PromotionTable from "../components/promotions/PromotionTable.jsx";
import PromotionModal from "../components/promotions/PromotionModal.jsx";

function Promotions() {
  const {
    promotions,
    loading,
    error,
    createPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotions();

  const [editPromotion, setEditPromotion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = promotions.filter((promo) => {
    const matchSearch = promo.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || String(Number(promo.status)) === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditPromotion(null);
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditPromotion(promo);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditPromotion(null);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    const result = editPromotion
      ? await updatePromotion(editPromotion.id, payload)
      : await createPromotion(payload);
    setSubmitting(false);

    if (result.success) {
      alertSuccess(
        "Success",
        editPromotion ? "Promotion updated!" : "Promotion created!",
      );
      handleClose();
    } else {
      alertError("Error", result.error);
    }
  };

  const handleDelete = async (id) => {
    const result = await alertConfirmDelete(
      "Delete this Promotion?",
      "Do you really want to delete this promotion?"
    );
    if (!result.isConfirmed) return;

    const response = await deletePromotion(id);
    if (response.success){
      alertSuccess("Deleted", "Promotion deleted successfully");
    } else {
      alertError("Error", response.error);
    }
  };

  const handleToggleStatus = async (promo) => {
    const result = await updatePromotion(promo.id, {
      name: promo.name,
      type: promo.type,
      value: promo.value,
      apply_to: promo.apply_to,
      min_purchase: promo.min_purchase,
      start_date: promo.start_date,
      end_date: promo.end_date,
      status: !promo.status,
      product_ids: promo.products?.map((p) => p.id) ?? [],
    });
    if (result.success) {
      alertSuccess("Success", "Promotion status updated!");
    } else {
      alertError("Error", result.error);
    }
  };

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
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
            gap: 10,
          }}
        >
          <TicketDiscount
            size={40}
            color="#fff"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          Promotion & Discount
        </h2>
        <button
          onClick={openCreate}
          className="btn-shine-blue"
          style={{
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            gap: "8px",
            padding: "10px 20px",
            fontWeight: 600,
          }}
        >
          <Add size={24} color="white" variant="Linear" />
          New Promotion
        </button>
      </div>

      <PromotionFilter
        search={search}
        onSearchChange={(e) => setSearch(e.target.value)}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filterRef={filterRef}
      />

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(231,76,60,0.12)",
            color: "#ff7675",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <PromotionTable
        promotions={filtered}
        loading={loading}
        onEdit={openEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <PromotionModal
        show={showModal}
        onClose={handleClose}
        editPromotion={editPromotion}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}

export default Promotions;
