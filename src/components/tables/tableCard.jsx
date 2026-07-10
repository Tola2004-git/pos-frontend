import { glassCard } from "../../utils/styles";
import { ArrowSwapHorizontal, Edit, TickCircle, Trash } from "iconsax-react";

function TableCard({ table, onEdit, onDelete, onClear, onOpenMove, statusStyle }) {
  return (
    <div
      style={{
        ...glassCard,
        position: "relative",
        borderRadius: "20px",
        padding: "20px",
        border: `2px solid ${statusStyle.border}`,
        background: statusStyle.bg,
        transition: "all 0.3s",
      }}
    >
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
          {table.capacity} seats
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
          {statusStyle.label}
        </div>
        <h3
          style={{
            color: "white",
            fontWeight: 400,
            margin: "10px 0 4px",
            fontSize: "1.5rem",
          }}
        >
          {table.name}
        </h3>
      </div>

      {table.note && (
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.75rem",
            textAlign: "center",
            marginBottom: "14px",
          }}
        >
          {table.note}
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", justifyContent: "end", flexWrap: "wrap" }}>
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
                Move Table
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
                Clear Table
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
            Delete
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableCard;
