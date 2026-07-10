import AlertToast from "../common/AlertToast";
import { useLowStock } from "../../context/LowStockContext";

export default function LowStockToastStack() {
  const { lowStockProducts, dismissLowStock } = useLowStock();

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-[10000] flex flex-col gap-3">
      {lowStockProducts.map((p) => (
        <AlertToast
          key={p.id}
          type="warning"
          title="Low Stock Warning"
          message={`${p.name} — ${p.qty} left`}
          onClose={() => dismissLowStock(p.id)}
        />
      ))}
    </div>
  );
}
