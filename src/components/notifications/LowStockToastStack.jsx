import AlertToast from "../common/AlertToast";
import { useLowStock } from "../../context/LowStockContext";
import { useTranslations } from "../../hooks/useTranslations";

export default function LowStockToastStack() {
  const { toastLowStockProducts, dismissLowStock } = useLowStock();
  const { t } = useTranslations();

  if (toastLowStockProducts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-[10000] flex flex-col gap-3">
      {toastLowStockProducts.map((p) => (
        <AlertToast
          key={p.id}
          type="warning"
          title={t.lowStockWarningTitle}
          message={t.lowStockWarningMsg
            .replace("{name}", p.name)
            .replace("{qty}", p.qty)}
          closeLabel={t.closeAction}
          onClose={() => dismissLowStock(p.id)}
        />
      ))}
    </div>
  );
}
