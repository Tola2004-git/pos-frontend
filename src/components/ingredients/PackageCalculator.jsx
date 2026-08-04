import { useState } from "react";
import { Calculator, ArrowDown2, ArrowUp2 } from "iconsax-react";
import { inputStyle, labelStyle } from "../../constants/inventoryStyles";

// Ingredient stock/recipes are tracked in a single free-text unit (e.g. "g")
// with no conversion built into the system (see IngredientModal/RecipeModal)
// - restocking still happens in real-world purchase units (a 5kg bag, a 1L
// bottle). This lets the admin type the purchase as-bought and derives the
// base-unit quantity and per-unit cost instead of doing that math by hand
// every time.
// The ingredient `unit` field is free text (no enum/validation - see
// IngredientController::store), so admins type it inconsistently in
// practice ("kg" vs "Kg" vs "kgs"). Strip a trailing plural "s" and
// whitespace/case before matching known units so those small typos still
// get the auto kg<->g / L<->ml conversion instead of silently falling back
// to "no conversion available".
function normalizeUnit(unit) {
  return (unit || "").trim().toLowerCase().replace(/s$/, "");
}

function getPackageUnitOptions(baseUnit) {
  const u = normalizeUnit(baseUnit);
  if (["g", "gram"].includes(u)) {
    return [{ label: "g", factor: 1 }, { label: "kg", factor: 1000 }];
  }
  if (["kg", "kilogram"].includes(u)) {
    return [{ label: "kg", factor: 1 }, { label: "g", factor: 0.001 }];
  }
  if (["ml", "milliliter", "millilitre"].includes(u)) {
    return [{ label: "ml", factor: 1 }, { label: "L", factor: 1000 }];
  }
  if (["l", "liter", "litre"].includes(u)) {
    return [{ label: "L", factor: 1 }, { label: "ml", factor: 0.001 }];
  }
  return [{ label: baseUnit || "unit", factor: 1 }];
}

export default function PackageCalculator({ baseUnit, showQuantity = true, onApply, t }) {
  const [open, setOpen] = useState(false);
  const [packageSize, setPackageSize] = useState("");
  const [packageUnitIdx, setPackageUnitIdx] = useState(0);
  const [pricePaid, setPricePaid] = useState("");

  const unitOptions = getPackageUnitOptions(baseUnit);
  const factor = unitOptions[packageUnitIdx]?.factor ?? 1;

  const size = parseFloat(packageSize);
  const price = parseFloat(pricePaid);
  const validInputs = size > 0 && price >= 0;
  const convertedQuantity = validInputs ? size * factor : null;
  const costPerUnit = validInputs && convertedQuantity > 0 ? price / convertedQuantity : null;

  const handleApply = () => {
    if (!validInputs) return;
    onApply({
      quantity: Number(convertedQuantity.toFixed(3)),
      costPerUnit: Number(costPerUnit.toFixed(4)),
    });
    setPackageSize("");
    setPricePaid("");
  };

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        border: "1px dashed var(--surface-border)",
        borderRadius: "12px",
        padding: open ? "14px" : "10px 14px",
      }}
    >
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Calculator size={18} color="currentColor" variant="Linear" className="text-white" />
          <span style={{ color: "var(--accent-border-full)", fontSize: "0.88rem", fontWeight: 600 }}>
            {t.packageCalculatorTitle}
          </span>
        </div>
        {open ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />}
      </div>

      {open && (
        <div style={{ marginTop: "12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: showQuantity ? "1fr 1fr 1fr" : "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div>
              <label style={labelStyle}>{t.packageSizeLabel}</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5"
                  value={packageSize}
                  onChange={(e) => setPackageSize(e.target.value)}
                />
                <select
                  style={{ ...inputStyle, cursor: "pointer", maxWidth: "80px" }}
                  value={packageUnitIdx}
                  onChange={(e) => setPackageUnitIdx(Number(e.target.value))}
                >
                  {unitOptions.map((opt, idx) => (
                    <option key={opt.label} value={idx} style={{ background: "#2c3e50", color: "white" }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>{t.pricePaidLabel}</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                placeholder="10.00"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
              />
            </div>
          </div>

          {validInputs && (
            <div style={{ color: "var(--accent-border-soft)", fontSize: "0.8rem", marginBottom: "10px" }}>
              {showQuantity &&
                t.packageCalcQuantityPreview
                  .replace("{qty}", convertedQuantity.toFixed(3))
                  .replace("{unit}", baseUnit)}
              {showQuantity ? " · " : ""}
              {t.packageCalcCostPreview.replace("{cost}", costPerUnit.toFixed(4)).replace("{unit}", baseUnit)}
            </div>
          )}

          <button
            type="button"
            onClick={handleApply}
            disabled={!validInputs}
            className="btn-shine-blue"
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.82rem",
              border: "none",
              opacity: validInputs ? 1 : 0.5,
              cursor: validInputs ? "pointer" : "not-allowed",
            }}
          >
            {t.packageCalcApplyAction}
          </button>
        </div>
      )}
    </div>
  );
}
