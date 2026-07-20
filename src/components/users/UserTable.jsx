import { glassCard } from "../../utils/styles";
import { SkeletonTable } from "../ui/SkeletonUser";
import { Trash, Edit2, Edit } from "iconsax-react";

function TooltipButton({ onClick, tooltip, children }) {
  return (
    <div className="tooltip-wrapper">
      <button
        onClick={onClick}
        style={{
          padding: "8px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s",
        }}
        className="hover:scale-110"
      >
        {children}
      </button>
      <div className="tooltip">{tooltip}</div>
      <style>
        {`
          .tooltip-wrapper {
            position: relative;
            display: inline-block;
          }

          .tooltip {
            position: absolute;
            bottom: 120%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(20,28,35,0.95);
            color: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 0.75rem;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            border: 1px solid rgba(255,255,255,0.1);
            z-index: 10;
          }

          .tooltip-wrapper:hover .tooltip {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
}

function UserTable({ users = [], loading, onEdit, onDelete, currentUser, t }) {
  return (
    <div style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}>
      <div className="w-full overflow-x-auto table-scroll-x">
        <table
          className="w-full min-w-[1000px] border-collapse"
          style={{ color: "white", fontSize: "0.85rem" }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {[
                "#",
                t.userColProfile,
                t.userColName,
                t.userColEmail,
                t.userColRole,
                t.userColCreated,
                t.userColUpdated,
                t.productColActions,
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    fontWeight: 600,
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonTable rows={6} />
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {t.noUsersFoundMsg}
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id || index}
                  style={{
                    height: "56px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {index + 1}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {user.profile_image ? (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <img
                          src={user.profile_image}
                          alt={user.name}
                          style={{
                            // width: "100%",
                            // height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #667eea, #764ba2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 700,
                        }}
                      >
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "white",
                      fontSize: "0.85rem",
                    }}
                  >
                    {user.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {user.email}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "white",
                        border: "1px solid white",
                      }}
                    >
                      {user.role === "admin" ? t.roleAdmin : t.roleCashier}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(user.updated_at).toLocaleDateString("en-GB")}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {user.role === "admin" && user.id !== currentUser?.id ? (
                      <span className="text-white/30 text-xs italic">
                        {t.protectedLabel}
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <TooltipButton
                          onClick={() => onEdit(user)}
                          tooltip={t.editAction}
                        >
                          <Edit size={18} color="#fff" variant="linear" />
                        </TooltipButton>

                        <TooltipButton
                          onClick={() => onDelete(user.id)}
                          tooltip={t.deleteAction}
                        >
                          <Trash size={18} color="#fff" variant="linear" />
                        </TooltipButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserTable;
