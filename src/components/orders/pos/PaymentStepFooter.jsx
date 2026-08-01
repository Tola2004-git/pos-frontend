import { ArrowLeft2, Edit2, TickCircle } from "iconsax-react";
import { HoldOrderAction } from "../../payment/HoldOrderAction";
import { PosSpinner } from "./PosSpinner";

export function PaymentStepFooter({
  t,
  setPosStep,
  isEditMode,
  isConfirming,
  isHolding,
  orderType,
  tableSelection,
  handleHoldOrder,
  handleUpdateOrder,
  handleCompletePayment,
  handleConfirmOrder,
  confirmDisabled,
  selectedPayment,
  safeAmountPaid,
  totalAmountWithDiscount,
}) {
  const tableBlocked =
    orderType === "dine-in" &&
    (!tableSelection.selectedTableId || tableSelection.tableLoading);

  return (
    <>
      <div className="mt-2 grid grid-cols-3 gap-3 pb-2">
        <button
          onClick={() => setPosStep(1)}
          className="btn-cancel-glass flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all active:scale-95"
          style={{
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft2 size={18} color="currentColor" variant="Linear" />
          {t.back2}
        </button>

        {!isEditMode && (
          <HoldOrderAction
            onHold={handleHoldOrder}
            loading={isHolding}
            disabled={isConfirming || tableBlocked}
            t={t}
          />
        )}

        {isEditMode ? (
          <>
            <button
              onClick={handleUpdateOrder}
              disabled={isConfirming || tableBlocked}
              className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
              style={{
                borderRadius: "12px",
                fontWeight: 500,
                opacity: isConfirming || tableBlocked ? 0.5 : 1,
                cursor: isConfirming || tableBlocked ? "not-allowed" : "pointer",
              }}
            >
              {isConfirming ? (
                <>
                  <PosSpinner />
                  {t.updating}
                </>
              ) : (
                <>
                  <Edit2 size={18} color="white" variant="Outline" />
                  {t.update}
                </>
              )}
            </button>

            <button
              onClick={handleCompletePayment}
              disabled={
                isConfirming ||
                tableBlocked ||
                !selectedPayment ||
                safeAmountPaid < totalAmountWithDiscount
              }
              className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
              style={{
                borderRadius: "12px",
                fontWeight: 500,
                opacity:
                  isConfirming ||
                  tableBlocked ||
                  !selectedPayment ||
                  safeAmountPaid < totalAmountWithDiscount
                    ? 0.5
                    : 1,
                cursor:
                  isConfirming ||
                  tableBlocked ||
                  !selectedPayment ||
                  safeAmountPaid < totalAmountWithDiscount
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isConfirming ? (
                <>
                  <PosSpinner />
                  {t.completing}
                </>
              ) : (
                <>
                  <TickCircle size={18} color="white" variant="Outline" />
                  {t.payNow}
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() =>
              handleConfirmOrder({
                status: orderType === "dine-in" ? "completed" : "completed",
                tableId: orderType === "dine-in" ? tableSelection.selectedTableId : null,
              })
            }
            disabled={confirmDisabled}
            className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
            style={{
              borderRadius: "12px",
              fontWeight: 500,
              opacity: confirmDisabled ? 0.5 : 1,
              cursor: confirmDisabled ? "not-allowed" : "pointer",
            }}
          >
            {isConfirming ? (
              <>
                <PosSpinner />
                {t.confirming}
              </>
            ) : (
              <>
                <TickCircle size={18} color="white" variant="Outline" />
                {t.confirm}
              </>
            )}
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default PaymentStepFooter;
