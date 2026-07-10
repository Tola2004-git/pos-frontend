import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, InfoCircle } from "iconsax-react";
import { glassCard } from "../../utils/styles";

export default function ItemsPopover({ order }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const popoverRef = useRef(null);
  const items = order.items || [];

  const updateCoords = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left,
      top: rect.bottom + 6,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateCoords();

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
        {items.length} item{items.length === 1 ? "" : "s"}
      </span>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="View items"
        style={{ padding: "6px", margin: "-6px" }}
        className="inline-flex cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-white/60 transition-colors hover:text-white"
      >
        <InfoCircle size={16} color="currentColor" variant="Linear" />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              ...glassCard,
              position: "fixed",
              left: coords.left,
              top: coords.top + 4,
              borderRadius: "14px",
              zIndex: 99999,
              width: "200px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <ul
              style={{
                maxHeight: "190px",
                overflowY: "auto",
                margin: 0,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                listStyle: "none",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
              }}
              className="overflow-y-auto flex flex-col gap-2 m-0 list-none [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
            >
              {items.length === 0 ? (
                <li className="text-[0.8rem] text-white/50">No items</li>
              ) : (
                items.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-white/20 pb-2 text-[0.8rem] last:border-0 last:pb-0"
                  >
                    {item.product_name} x{item.quantity}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
