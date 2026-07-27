import { useState } from "react";
import { RiEditLine, RiDeleteBinLine } from "react-icons/ri";
import { glass, colors } from "../../utils/styles";
import { paymentStyles } from "../../styles/paymentStyles";
import { Edit, Trash, Eye, Bank } from "iconsax-react";
import { alertSuccess, alertError, alertWarning, alertConfirmDelete} from "../../utils/alert.jsx";
import { Tooltip } from "../ui/Tooltip";
function PaymentMethodCard({
  method,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  t,
}) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const nextStatus = !method.status;
    try {
      const result = await onToggleStatus(method);
      if (result?.success) {
        alertSuccess(t.statusChangedTitle, nextStatus ? t.methodActivatedMsg : t.methodDeactivatedMsg);
      } else {
        alertError(t.toggleFailedTitle, result?.error || t.unableToUpdateStatusMsg);
      }
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    const result = await alertConfirmDelete(t.deletePaymentConfirmTitle, t.deletePaymentConfirmMsg, t.cancel, t.deleteAction);
    if (!result.isConfirmed) return;

    setIsDeleting(true);
    try {
      const deleteResult = await onDelete(method.id);
      if (deleteResult.success){
        alertSuccess(t.paymentDeletedTitle, t.paymentDeletedMsg);
      }else{
        alertError(t.tableDeleteFailedTitle, deleteResult?.error || t.unableToDeleteMsg );
      }
    } finally {
      setIsDeleting(false);
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
          fontSize: "1.2rem",
          margin: "0 0 8px",
        }}
      >
        {method.bank_name || method.name || t.paymentMethodFallback}
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
          onClick={isToggling ? undefined : handleToggleStatus}
          style={{
            ...paymentStyles.statusToggle,
            background: method.status ? "#2ecc71" : "rgba(255,255,255,0.2)",
            opacity: isToggling ? 0.5 : 1,
            cursor: isToggling ? "not-allowed" : "pointer",
            pointerEvents: isToggling ? "none" : "auto",
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
              label: t.viewAction,
              action: () => onView?.(method),
            },
            {
              icon: <Edit size={20} color="white" variant="Outline" />,
              label: t.editAction,
              action: () => onEdit(method),
            },
            {
              icon: isDeleting ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <Trash size={20} color="white" variant="Outline" />
              ),
              label: t.deleteAction,
              action: handleDelete,
              disabled: isDeleting,
            },
          ].map(({ icon, label, action, disabled }) => (
            <Tooltip key={label} label={label}>
              <button
                onClick={action}
                disabled={disabled}
                className={disabled ? "" : "duration-200 hover:scale-110 transition-transform"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: disabled ? "not-allowed" : "pointer",
                  padding: "5px",
                  fontSize: "0.9rem",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {icon}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodCard;
