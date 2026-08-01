import { glassCard, accentBorder } from "../../utils/styles";
import { SkeletonTable } from "../ui/SkeletonUser";
import { Trash, Edit2, Edit } from "iconsax-react";
import { Tooltip } from "../ui/Tooltip";

function UserTable({
  users = [],
  loading,
  onEdit,
  onDelete,
  currentUser,
  deletingId,
  t,
}) {
  return (
    <div style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}>
      <div className="w-full overflow-x-auto table-scroll-x">
        <table
          className="w-full min-w-[1000px] border-collapse"
          style={{ color: "var(--accent-border-full)", fontSize: "0.85rem" }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--surface-tint-12)",
                background: "var(--surface-tint-05)",
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
                    color: "var(--accent-border-full)",
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
                    color: "var(--accent-border-soft)",
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
                    borderBottom: "1px solid var(--surface-tint-05)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--surface-tint-05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--accent-border-soft)",
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
                          border: "2px solid var(--surface-border)",
                        }}
                      >
                        <img
                          src={user.profile_image}
                          alt={user.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center top",
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
                      color: "var(--accent-border-full)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {user.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--accent-border-soft)",
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
                        color: "var(--accent-border-full)",
                        border: `1px solid ${accentBorder.full}`,
                      }}
                    >
                      {user.is_owner
                        ? t.roleOwner
                        : user.role === "admin"
                          ? t.roleAdmin
                          : t.roleCashier}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--accent-border-soft)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(user.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "var(--accent-border-soft)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(user.updated_at).toLocaleDateString("en-GB")}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {user.is_owner && user.id !== currentUser?.id ? (
                      <span className="text-white/30 text-xs italic">
                        {t.ownerProtectedMsg}
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <Tooltip label={t.editAction}>
                          <button
                            onClick={() => onEdit(user)}
                            className="duration-200 hover:scale-110 transition-transform"
                            style={{
                              padding: "8px",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Edit size={18} color="currentColor" variant="linear" className="text-white" />
                          </button>
                        </Tooltip>

                        {user.id !== currentUser?.id && (
                          <Tooltip label={t.deleteAction}>
                            <button
                              onClick={() => onDelete(user.id)}
                              disabled={deletingId === user.id}
                              className={
                                deletingId === user.id
                                  ? ""
                                  : "duration-200 hover:scale-110 transition-transform"
                              }
                              style={{
                                padding: "8px",
                                borderRadius: "8px",
                                border: "none",
                                cursor:
                                  deletingId === user.id
                                    ? "not-allowed"
                                    : "pointer",
                                background: "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: deletingId === user.id ? 0.6 : 1,
                              }}
                            >
                              {deletingId === user.id ? (
                                <svg
                                  className="animate-spin"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  fill="none"
                                >
                                  <circle
                                    cx="9"
                                    cy="9"
                                    r="7"
                                    stroke="var(--surface-border)"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M9 2 A7 7 0 0 1 16 9"
                                    stroke="var(--accent-border-full)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              ) : (
                                <Trash
                                  size={18}
                                  color="currentColor"
                                  variant="linear"
                                  className="text-white"
                                />
                              )}
                            </button>
                          </Tooltip>
                        )}
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
