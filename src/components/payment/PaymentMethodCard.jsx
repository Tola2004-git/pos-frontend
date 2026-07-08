import { RiEditLine, RiDeleteBinLine } from "react-icons/ri";
import { glass, colors } from "../../utils/styles";
import { paymentStyles } from "../../styles/paymentStyles";
import { Edit, Trash, Eye, Bank } from "iconsax-react";
import { alertSuccess, alertError, alertWarning, alertConfirmDelete} from "../../utils/alert.jsx";
function PaymentMethodCard({
  method,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
}) {
  const handleToggleStatus = () => {
    onToggleStatus(method);
    alertSuccess("Status Changed", method.status ? "Payment method activated" : "Payment method deactivated");
  };

  const handleDelete = async () => {
    const result = await alertConfirmDelete("Delete payment method?", "Do you really want to delete this payment method?");
    if (!result.isConfirmed) return;

    const deleteResult = await onDelete(method.id);
    if (deleteResult.success){
      alertSuccess("Deleted", "Payment method has been deleted");
    }else{
      alertError("Delete Failed", deleteResult?.error || "Unable to delete payment method" );
    }
  };
  return (
    <div
      style={{
        ...glass,
        borderRadius: "20px",
        padding: "28px 24px 20px",
        border: `1px solid ${method.status ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
        opacity: method.status ? 1 : 0.6,
        transition: "all 0.2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "128px",
          height: "128px",
          // margin: "0 auto 10px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {method.icon ? (
          <img
            src={method.icon}
            alt={method.bank_name || method.name || "Bank logo"}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <Bank size={56} color="white" variant="Outline" />
        )}
      </div>

      <h3
        style={{
          color: "white",
          fontSize: "1.7rem",
          margin: "0 0 8px",
        }}
      >
        {method.bank_name || method.name || "Payment Method"}
      </h3>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "4px",
        }}
      >
        <div
          onClick={handleToggleStatus}
          style={{
            ...paymentStyles.statusToggle,
            background: method.status ? "#2ecc71" : "rgba(255,255,255,0.2)",
          }}
        >
          <div
            style={{
              ...paymentStyles.toggleSlider,
              left: method.status ? "22px" : "3px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {[
            {
              icon: <Eye size={20} color="white" variant="Outline" />,
              label: "View",
              action: () => onView?.(method),
            },
            {
              icon: <Edit size={20} color="white" variant="Outline" />,
              label: "Edit",
              action: () => onEdit(method),
            },
            {
              icon: <Trash size={20} color="white" variant="Outline" />,
              label: "Delete",
              action: handleDelete,
            },
          ].map(({ icon, label, action }) => (
            <div
              key={label}
              style={{ position: "relative", display: "inline-block" }}
              onMouseEnter={(e) =>
                (e.currentTarget.querySelector(".tooltip").style.opacity = 1)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.querySelector(".tooltip").style.opacity = 0)
              }
            >
              <button
                onClick={action}
                className="duration-200 hover:scale-110 transition-transform"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: "5px",
                }}
              >
                {icon}
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
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodCard;
