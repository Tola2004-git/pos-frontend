import { glassCard } from "../../utils/styles";
import LowStockIcon from "../../assets/icons/low-stock.png";
import { inputStyle, labelStyle } from "../../constants/inventoryStyles";
import { Notification } from "iconsax-react";

export default function ThresholdSetting({
  thresholdRef,
  threshold,
  showThreshold,
  setShowThreshold,
  tempThreshold,
  setTempThreshold,
  saveThreshold,
}) {
  return (
    <div ref={thresholdRef} style={{ position: "relative" }}>
      <button
        onClick={() => {
          setShowThreshold(!showThreshold);
          setTempThreshold(threshold);
        }}
        style={{
          ...glassCard,
          padding: "10px 16px",
          borderRadius: "12px",
          cursor: "pointer",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontWeight: 600,
        }}
      >
        <Notification size="20" color="#fff" variant="Outline"/>
        Low Stock: {threshold}
      </button>

      {showThreshold && (
        <div
          style={{
            ...glassCard,
            position: "absolute",
            top: "110%",
            right: 0,
            zIndex: 10000,
            borderRadius: "14px",
            padding: "16px",
            minWidth: "220px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.82rem",
              marginBottom: "10px",
            }}
          >
            Set Low Stock threshold
          </p>
          <input
            type="number"
            value={tempThreshold}
            onChange={(e) => setTempThreshold(e.target.value)}
            style={{ ...inputStyle, marginBottom: "10px" }}
            min="1"
          />
          <button
            onClick={saveThreshold}
            className="btn-shine-blue"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
