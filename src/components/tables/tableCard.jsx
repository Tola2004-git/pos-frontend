import { glassCard } from "../../utils/styles";
import { ArrowSwapHorizontal, Edit, TickCircle, Trash, PauseCircle } from "iconsax-react";

const STATUS_LABEL_KEYS = {
  available: "tableStatAvailable",
  occupied: "tableStatOccupied",
  reserved: "tableStatReserved",
};

function TableCard({
  table,
  onEdit,
  onDelete,
  onClear,
  onOpenMove,
  onSelect,
  statusStyle,
  readOnly = false,
  t,
}) {
  const hasHeldOrder = table.current_order?.status === "pending";
  // t is only passed by the cashier's read-only table grid - the admin
  // Tables management page renders this same component without it, so every
  // lookup falls back to the English default already baked into statusStyle
  // rather than crashing on an undefined t.
  const statusLabel = t?.[STATUS_LABEL_KEYS[table.status]] || statusStyle.label;
  const heldLabel = t?.heldLabel || "Held";
  const moveTableLabel = t?.moveTableAction || "Move Table";
  const clearTableLabel = t?.clearTableAction || "Clear Table";
  const editLabel = t?.editAction || "Edit";
  const deleteLabel = t?.deleteAction || "Delete";
  const seatsLabel = t?.seats || "seats";

  return (
    <div
      onClick={readOnly && onSelect ? () => onSelect(table) : undefined}
      style={{
        ...glassCard,
        position: "relative",
        borderRadius: "20px",
        padding: "20px",
        border: `2px solid ${hasHeldOrder ? "rgba(243,156,18,0.7)" : statusStyle.border}`,
        background: statusStyle.bg,
        transition: "all 0.3s",
        cursor: readOnly && onSelect ? "pointer" : "default",
      }}
      className={readOnly && onSelect ? "hover:scale-[1.02] transition-transform" : ""}
    >
      {hasHeldOrder && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 9px",
            borderRadius: "999px",
            background: "rgba(243,156,18,0.25)",
            border: "1px solid rgba(243,156,18,0.7)",
            color: "#f39c12",
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.3px",
          }}
        >
          <PauseCircle size={12} color="#f39c12" variant="Bold" />
          {heldLabel}
        </div>
      )}
      <div
        style={{ position: "absolute", top: "12px", left: "12px", display: "inline-block" }}
        onMouseEnter={(e) =>
          (e.currentTarget.querySelector(".tooltip").style.opacity = 1)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.querySelector(".tooltip").style.opacity = 0)
        }
      >
        <div
          style={{
            border: `1px solid ${statusStyle.border}`,
            color: "white",
            padding: "6px 10px",
            borderRadius: "50%",
            fontWeight: 700,
            fontSize: "0.9rem",
            minWidth: "36px",
            textAlign: "center",
            background: "rgba(0,0,0,0.1)",
          }}
        >
          {table.capacity}
        </div>
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
            transition: "opacity 0.1s",
            border: "1px solid rgba(255,255,255,0.1)",
            zIndex: 10,
          }}
        >
          {table.capacity} {seatsLabel}
        </div>
      </div>
      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <img
          src="/assets/table.png"
          alt={`${table.name} table`}
          style={{
            width: "130px",
            height: "130px",
            marginBottom: "8px",
            objectFit: "contain",
            display: "block",
            margin: "0 auto 8px",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.14)",
            color: "white",
            fontSize: "0.8rem",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: statusStyle.color, fontSize: "0.7rem" }}>●</span>
          {statusLabel}
        </div>
        <h3
          style={{
            color: "white",
            fontWeight: 400,
            margin: "10px 0 4px",
            fontSize: "1.2rem",
          }}
        >
          {table.name}
        </h3>
      </div>

      {table.notes && (
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.75rem",
            textAlign: "center",
            marginBottom: "14px",
          }}
        >
          {table.notes}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", justifyContent: "end", flexWrap: "wrap" }}>
        {readOnly ? (
          ["occupied", "reserved"].includes(table.status) && (
            <>
              {onOpenMove && (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMove(table);
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="duration-200 hover:scale-110 transition-transform"
                  >
                    <ArrowSwapHorizontal size={20} color="white" variant="Linear" />
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
                      margin: "5px"
                    }}
                  >
                    {moveTableLabel}
                  </div>
                </div>
              )}
              {onClear && (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear(table);
                    }}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="duration-200 hover:scale-110 transition-transform"
                  >
                    <TickCircle size={20} color="white" variant="Linear" />
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
                      margin: "5px"
                    }}
                  >
                    {clearTableLabel}
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          <>
            {["occupied", "reserved"].includes(table.status) && (
              <>
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
                    onClick={() => onOpenMove(table)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="duration-200 hover:scale-110 transition-transform"
                  >
                    <ArrowSwapHorizontal size={20} color="white" variant="Linear" />
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
                      margin: "5px"
                    }}
                  >
                    {moveTableLabel}
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
                    onClick={() => onClear(table)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    className="duration-200 hover:scale-110 transition-transform"
                  >
                    <TickCircle size={20} color="white" variant="Linear" />
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
                      margin: "5px"
                    }}
                  >
                    {clearTableLabel}
                  </div>
                </div>
              </>
            )}
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
                onClick={() => onEdit(table)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="duration-200 hover:scale-110 transition-transform"
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
                  margin: "5px"
                }}
              >
                {editLabel}
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
                onClick={() => onDelete(table.id)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="duration-200 hover:scale-110 transition-transform"
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
                  margin: "5px"
                }}
              >
                {deleteLabel}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TableCard;
