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
import { Tooltip } from "../ui/Tooltip";

export default function PromotionRow({
  index,
  promo,
  onEdit,
  onDelete,
  onToggleStatus,
  isDeleting = false,
  t,
}) {
  const [showPopover, setShowPopover] = useState(false);
  const [popoverMounted, setPopoverMounted] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
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
    let timeout;
    if (showPopover) {
      setPopoverMounted(true);
      requestAnimationFrame(() => setPopoverVisible(true));
    } else {
      setPopoverVisible(false);
      timeout = setTimeout(() => setPopoverMounted(false), 200);
    }
    return () => clearTimeout(timeout);
  }, [showPopover]);

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
      return { label: t.allProductsLabel, items: [] };
    }
    if (promo.apply_to === "product") {
      return {
        label: t.productsCountLabel.replace("{n}", promo.products?.length ?? 0),
        items: promo.products?.map((p) => p.name) ?? [],
      };
    }
    if (promo.apply_to === "category") {
      return {
        label: t.categoriesLabel,
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
      <tr style={{ borderBottom: "1px solid var(--surface-tint-06)", height: 56 }}>
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
            <span>{formatApplyTo(promo, t)}</span>
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
                  color="currentColor"
                  variant="Linear"
                  className="text-white/50 hover:text-white transition-colors duration-200"
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
          color: "var(--accent-border-soft)",
        }}
      >
        {formatDate(promo.start_date)}
      </td>
      <td
        style={{
          padding: "12px 14px",
          textAlign: "center",
          color: "var(--accent-border-soft)",
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
            whiteSpace: "nowrap",
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
              ? t.statusExpiredLabel
              : t.activeLabel
            : t.statusDisabledLabel}
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
          <Tooltip label={t.editAction}>
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
              }}
            >
              <Edit size={20} color="currentColor" variant="Linear" className="text-white" />
            </button>
          </Tooltip>
          <Tooltip label={t.deleteAction}>
            <button
              className="duration-200 hover:scale-110 transition-transform"
              type="button"
              onClick={() => onDelete(promo.id)}
              disabled={isDeleting}
              style={{
                border: "none",
                borderRadius: 8,
                cursor: isDeleting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                opacity: isDeleting ? 0.6 : 1,
              }}
            >
              {isDeleting ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <Trash size={20} color="currentColor" variant="Linear" className="text-white" />
              )}
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>

    {popoverMounted && createPortal(
      <div
        ref={popoverRef}
        style={{
          ...glassCard,
          position: "fixed",
          top: popoverPosition.top,
          left: popoverPosition.left,
          transform: popoverVisible
            ? "translate(-50%, 0) scale(1)"
            : "translate(-50%, -6px) scale(0.96)",
          opacity: popoverVisible ? 1 : 0,
          transition: "transform 200ms ease, opacity 200ms ease",
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
              color: "var(--accent-border-soft)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {promo.apply_to === "product" ? t.productsPopoverTitle : t.categoriesLabel}
          </div>
          <button
            type="button"
            onClick={closePopover}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: "var(--accent-border-soft)",
            }}
          >
            <CloseCircle
              size={18}
              variant="Linear"
              style={{ transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-border-full)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--accent-border-soft)")}
            />
          </button>
        </div>

        <ul
          className="thin-light-scrollbar"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {applyToDetails.items.map((item, idx) => (
            <li
              key={idx}
              style={{
                fontSize: "0.85rem",
                color: "var(--accent-border-full)",
                padding: "10px 12px",
                background: "var(--surface-tint-05)",
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
