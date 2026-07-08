import { glassCard, colors } from "../../utils/styles";
import { SkeletonTable } from "../ui/SkeletonUser";
import { Trash, Edit } from "iconsax-react";

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

function UserTable({ users = [], loading, onEdit, onDelete }) {
  return (
    <div style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              "#",
              "Profile",
              "Name",
              "Email",
              "Role",
              "Created",
              "Updated",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  color: colors.whiteFull,
                  fontWeight: 600,
                  fontSize: "1.1rem",
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
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={user.id || index}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td
                  style={{
                    padding: "14px 20px",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {index + 1}
                </td>
                <td style={{ padding: "14px 20px" }}>
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
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
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
                <td style={{ padding: "14px 20px", color: "white" }}>
                  {user.name}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {user.email}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "white",
                      border: "1px solid white",
                    }}
                  >
                    {user.role || "cashier"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  {new Date(user.created_at).toLocaleDateString("en-GB")}
                </td>
                <td
                  style={{
                    padding: "14px 20px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  {new Date(user.updated_at).toLocaleDateString("en-GB")}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <TooltipButton
                      onClick={() => onEdit(user)}
                      tooltip="Edit User"
                    >
                      <Edit size="20" color="#fff" />
                    </TooltipButton>

                    <TooltipButton
                      onClick={() => onDelete(user.id)}
                      tooltip="Delete User"
                    >
                      <Trash size="20" color="#fff" />
                    </TooltipButton>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
