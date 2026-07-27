// Best-effort check that a payment-method-shaped object represents Cash.
// Prefers the durable `is_cash` flag (survives renaming - the backend blocks
// renaming the seeded Cash method away from "Cash", but that guard lives in
// a different file, so name/type matching alone is one refactor away from
// silently breaking); falls back to name/type/placeholder-id matching for
// objects that don't carry the flag (e.g. the UI's own "cash" placeholder
// before the real record is resolved).
export function isCashLike(method) {
  if (!method) return false;
  return (
    method.is_cash === true ||
    method.name?.toLowerCase() === "cash" ||
    method.type === "cash" ||
    method.id === "cash"
  );
}

// Finds the real Cash PaymentMethod record (with its actual DB id, which
// varies per environment since it's seeded via updateOrInsert) from a
// fetched list. Prefers `is_cash` over name/type matching.
export function findRealCashMethod(paymentMethodsSource = []) {
  return (
    paymentMethodsSource.find((m) => m.is_cash) ||
    paymentMethodsSource.find(isCashLike) ||
    null
  );
}
