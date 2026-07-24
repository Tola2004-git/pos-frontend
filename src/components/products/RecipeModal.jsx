import { useEffect, useState } from "react";
import { glass, glassCard, colors } from "../../utils/styles";
import { alertSuccess, alertError } from "../../utils/alert.jsx";
import {
  Cake,
  AddCircle,
  MinusCirlce,
  TickCircle,
  InfoCircle,
} from "iconsax-react";
import {
  fetchProductIngredientsApi,
  syncProductIngredientsApi,
} from "../../api/recipeApi";

function RecipeModal({ product, ingredients, onClose, onSuccess, t }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductIngredientsApi(product.id)
      .then((res) => {
        if (cancelled) return;
        setRows(
          (res.data || []).map((ing) => ({
            ingredient_id: String(ing.id),
            quantity: String(ing.pivot?.quantity ?? ""),
          })),
        );
      })
      .catch((err) => console.error("Failed to load recipe:", err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const inputStyle = {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.85rem",
    outline: "none",
  };

  const addRow = () => {
    setRows((prev) => [...prev, { ingredient_id: "", quantity: "" }]);
  };

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const usedIngredientIds = new Set(rows.map((r) => r.ingredient_id).filter(Boolean));

  const estimatedUnitCost = rows.reduce((sum, row) => {
    const ing = ingredients.find((i) => String(i.id) === row.ingredient_id);
    const qty = Number(row.quantity) || 0;
    return sum + qty * Number(ing?.cost_per_unit || 0);
  }, 0);

  const handleSubmit = async () => {
    setError("");

    const invalidRow = rows.find(
      (row) => !row.ingredient_id || !row.quantity || Number(row.quantity) <= 0,
    );
    if (invalidRow) {
      setError(t.recipeInvalidRowMsg);
      return;
    }

    setSubmitting(true);
    try {
      await syncProductIngredientsApi(
        product.id,
        rows.map((row) => ({
          ingredient_id: Number(row.ingredient_id),
          quantity: Number(row.quantity),
        })),
      );
      alertSuccess(t.recipeUpdatedTitle, t.recipeUpdatedMsg);
      onSuccess?.();
      onClose();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        ...glass,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          ...glassCard,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              color: colors.whiteFull,
              fontWeight: 700,
              fontSize: "1.4rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Cake size={26} color="white" variant="Linear" />
            {t.recipeTitle}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            style={{
              border: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            ✕
          </button>
        </div>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.82rem",
            margin: "0 0 20px",
          }}
        >
          {product.name}
        </p>

        {error && (
          <div
            style={{
              background: "rgba(192,57,43,0.3)",
              border: "1px solid rgba(192,57,43,0.5)",
              color: "#ff6b6b",
              padding: "8px 12px",
              borderRadius: "8px",
              marginBottom: "12px",
              fontSize: "0.82rem",
              flexShrink: 0,
            }}
          >
            {error}
          </div>
        )}

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "20px" }}>
              {t.loadingMsg}
            </p>
          ) : rows.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "20px" }}>
              {t.recipeNoIngredientsMsg}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rows.map((row, index) => (
                <div key={index} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select
                    style={{ ...inputStyle, flex: 2, cursor: "pointer" }}
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(index, { ingredient_id: e.target.value })}
                  >
                    <option value="" style={{ background: "#2c3e50" }}>
                      {t.recipeSelectIngredientOption}
                    </option>
                    {ingredients
                      .filter(
                        (ing) =>
                          String(ing.id) === row.ingredient_id ||
                          (ing.status && !usedIngredientIds.has(String(ing.id))),
                      )
                      .map((ing) => (
                        <option key={ing.id} value={ing.id} style={{ background: "#2c3e50" }}>
                          {ing.name} ({ing.unit})
                          {!ing.status ? ` - ${t.inactiveLabel}` : ""}
                        </option>
                      ))}
                  </select>
                  <input
                    style={{ ...inputStyle, width: "90px" }}
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder={t.recipeQtyPlaceholder}
                    value={row.quantity}
                    onChange={(e) => updateRow(index, { quantity: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      display: "inline-flex",
                      flexShrink: 0,
                    }}
                    aria-label={t.recipeRemoveIngredientAction}
                  >
                    <MinusCirlce size={22} color="#e74c3c" variant="Linear" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <button
              type="button"
              onClick={addRow}
              style={{
                marginTop: "12px",
                border: "1px dashed rgba(255,255,255,0.3)",
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                borderRadius: "10px",
                padding: "10px",
                width: "100%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.85rem",
              }}
            >
              <AddCircle size={18} color="rgba(255,255,255,0.7)" variant="Linear" />
              {t.recipeAddIngredientAction}
            </button>
          )}
        </div>

        {!loading && rows.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(52,152,219,0.1)",
              flexShrink: 0,
            }}
          >
            <InfoCircle size={18} color="#3498db" variant="Linear" />
            <span style={{ color: "white", fontSize: "0.85rem" }}>
              {t.recipeEstimatedCostLabel}: <strong>${estimatedUnitCost.toFixed(2)}</strong>
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          <button
            onClick={() => !submitting && onClose()}
            className="btn-cancel-glass"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
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
            onClick={() => !submitting && !loading && handleSubmit()}
            className="btn-shine-blue"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "0.9rem",
              opacity: submitting || loading ? 0.8 : 1,
              cursor: submitting || loading ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            <TickCircle size="20" color="#fff" variant="outline" />
            {submitting ? t.savingAction : t.saveAction}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecipeModal;
