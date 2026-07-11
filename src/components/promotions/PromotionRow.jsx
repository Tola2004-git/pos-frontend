import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit, Edit2, Trash, InfoCircle, CloseCircle } from "iconsax-react";
import {
  formatApplyTo,
  formatDate,
  formatDiscount,
} from "../../constants/promotionConstants.js";
import StatusToggle from "./StatusToggle.jsx";
import { glassCard } from "../../utils/styles.js";

export default function PromotionRow({
  index,
  promo,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);

  const handleInfoClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
    setShowPopover((prev) => !prev);
  };

  const closePopover = () => setShowPopover(false);

  useEffect(() => {
    if (!showPopover) return undefined;

    const handleDocumentClick = (event) => {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [showPopover]);

  const getApplyToDetails = () => {
    if (promo.apply_to === "all") {
      return { label: "All Products", items: [] };
    }
    if (promo.apply_to === "product") {
      return {
        label: `${promo.products?.length ?? 0} Product(s)`,
        items: promo.products?.map((p) => p.name) ?? [],
      };
    }
    if (promo.apply_to === "category") {
      return {
        label: "Categories",
        items: promo.categories?.map((c) => c.name) ?? [],
      };
    }
    return { label: promo.apply_to, items: [] };
  };

  const isPromotionExpired = !!promo.is_expired;

  const applyToDetails = getApplyToDetails();
  const showInfoIcon = applyToDetails.items.length > 0;

  return (
    <>
      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", height: 56 }}>
        <td style={{ padding: "12px 14px", textAlign: "center" }}>{index + 1}</td>
        <td style={{ padding: "12px 14px", fontWeight: 500, textAlign: "left" }}>
          <div
            className="block max-w-[180px] truncate"
            title={promo.name}
          >
            {promo.name}
          </div>
        </td>
        <td style={{ padding: "12px 14px", textAlign: "center" }}>
          <span
            style={{
              color: promo.type === "percentage" ? "#3498db" : "#2ecc71",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: "1.25rem",
            }}
          >
            {promo.type === "percentage" ? "%" : "$"}
          </span>
        </td>
        <td style={{ padding: "12px 14px", textAlign: "center" }}>
          {formatDiscount(promo.type, promo.value)}
        </td>
        <td style={{ padding: "12px 14px", textAlign: "center", whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span>{formatApplyTo(promo)}</span>
            {showInfoIcon && (
              <button
                ref={buttonRef}
                type="button"
                onClick={handleInfoClick}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <InfoCircle
                  size={16}
                  color="rgba(255,255,255,0.5)"
                  variant="Linear"
                  className="hover:text-white transition-colors duration-200"
                  style={{ opacity: 0.6, transition: "opacity 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.6)}
                />
              </button>
            )}
          </div>
        </td>
      <td
        style={{
          padding: "12px 14px",
          textAlign: "center",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {formatDate(promo.start_date)}
      </td>
      <td
        style={{
          padding: "12px 14px",
          textAlign: "center",
          color: "rgba(255,255,255,0.7)",
        }}
      >
        {formatDate(promo.end_date)}
      </td>
      <td
        style={{
          padding: "12px 14px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: "0.8rem",
            fontWeight: 600,
            color: isPromotionExpired
              ? "#e74c3c"
              : promo.status
              ? "#2ecc71"
              : "#95a5a6",
            background: isPromotionExpired
              ? "rgba(231,76,60,0.12)"
              : promo.status
              ? "rgba(46,204,113,0.12)"
              : "rgba(149,165,166,0.12)",
          }}
        >
          {promo.status
            ? isPromotionExpired
              ? "Expired"
              : "Active"
            : "Disabled"}
        </span>
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        <StatusToggle
          active={!isPromotionExpired && !!promo.status}
          disabled={isPromotionExpired}
          onChange={() => onToggleStatus(promo)}
        />
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.opacity = 1)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.opacity = 0)
            }
          >
            <button
              className="duration-200 hover:scale-110 transition-transform"
              type="button"
              onClick={() => onEdit(promo)}
              style={{
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                // cursor: "pointer",
              }}
            >
              <Edit size={20} color="white" variant="Linear" />
            </button>
            <div
              className="tooltip"
              style={{
                position: "absolute",
                bottom: "110%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(20,28,35,0.95)",
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.2s",
                // border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: 5,
              }}
            >
              Edit
            </div>
          </div>
          <div
            style={{ position: "relative", display: "inline-block" }}
            onMouseEnter={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.opacity = 1)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.opacity = 0)
            }
          >
            <button
              className="duration-200 hover:scale-110 transition-transform"
              type="button"
              onClick={() => onDelete(promo.id)}
              style={{
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Trash size={20} color="white" variant="Linear" />
            </button>
            <div
              className="tooltip"
              style={{
                position: "absolute",
                bottom: "110%",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(20,28,35,0.95)",
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                opacity: 0,
                transition: "opacity 0.2s",
                marginBottom: 5,
              }}
            >
              Delete
            </div>
          </div>
        </div>
      </td>
    </tr>

    {showPopover && createPortal(
      <div
        ref={popoverRef}
        style={{
          ...glassCard,
          position: "fixed",
          top: popoverPosition.top,
          left: popoverPosition.left,
          transform: "translateX(-50%)",
          borderRadius: 10,
          padding: "12px 14px",
          width: 280,
          maxWidth: "calc(100vw - 20px)",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {promo.apply_to === "product" ? "Products" : "Categories"}
          </div>
          <button
            type="button"
            onClick={closePopover}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <CloseCircle
              size={18}
              variant="Linear"
              style={{ transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            />
          </button>
        </div>

        <ul
          className="[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: "220px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
          }}
        >
          {applyToDetails.items.map((item, idx) => (
            <li
              key={idx}
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.9)",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                borderLeft: "3px solid rgba(52,152,219,0.7)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>,
      document.body,
    )}
    </>
  );
}
