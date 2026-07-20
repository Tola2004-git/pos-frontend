import { useState, useEffect, useCallback } from "react";
import { fetchCurrentShiftApi, openShiftApi, closeShiftApi, addCashMovementApi } from "../api/shiftApi";

// CashierHome and CashierOrders each mount their own CashierLayout instance
// (see the comment on hasCheckedShiftThisSession there), which remounts this
// hook on every tab switch. Without caching the last known shift at module
// level, `shift` would reset to null on every remount - the header's Cash
// In/Out and Close Shift buttons (both gated on `shift` being truthy) would
// briefly vanish and reappear each time the background refetch resolves.
// Cleared explicitly on logout (see resetCashierShiftCache) so the next
// cashier to sign in on the same terminal doesn't inherit a stale shift.
let cachedShift = null;
let cachedShiftChecked = false;

export function resetCashierShiftCache() {
  cachedShift = null;
  cachedShiftChecked = false;
}

// Tracks the logged-in cashier's open shift (cash-drawer session). A
// cashier must open one (with a starting cash float) before selling, and
// closing one records a counted-cash total that the backend reconciles
// against actual cash sales rung up during the shift window.
export function useCashierShift() {
  const [shift, setShift] = useState(cachedShift);
  const [loading, setLoading] = useState(!cachedShiftChecked);
  // Distinguishes "confirmed no open shift" from "couldn't check" - without
  // this, a transient network/auth failure on the status check would look
  // identical to "no shift" and wrongly prompt to open a duplicate one even
  // though the cashier may already have one open server-side.
  const [fetchError, setFetchError] = useState(false);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeSummary, setCloseSummary] = useState(null);
  const [recordingMovement, setRecordingMovement] = useState(false);

  const fetchCurrent = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchCurrentShiftApi();
      cachedShift = res.data.shift || null;
      cachedShiftChecked = true;
      setShift(cachedShift);
      setFetchError(false);
    } catch (err) {
      console.error("Failed to fetch current shift", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrent();
  }, [fetchCurrent]);

  const openShift = useCallback(async ({ opening_cash_usd, opening_cash_khr }) => {
    setOpening(true);
    try {
      const res = await openShiftApi({ opening_cash_usd, opening_cash_khr });
      cachedShift = res.data.shift;
      setShift(cachedShift);
      return res.data.shift;
    } finally {
      setOpening(false);
    }
  }, []);

  const closeShift = useCallback(
    async ({ counted_cash_usd, counted_cash_khr, note }) => {
      if (!shift) return null;
      setClosing(true);
      try {
        const res = await closeShiftApi(shift.id, { counted_cash_usd, counted_cash_khr, note });
        setCloseSummary(res.data.shift);
        cachedShift = null;
        setShift(null);
        return res.data.shift;
      } finally {
        setClosing(false);
      }
    },
    [shift],
  );

  const dismissCloseSummary = useCallback(() => setCloseSummary(null), []);

  // Mid-shift cash drop / safe drop / petty-cash disbursement - doesn't
  // change `shift` itself (expected cash is only recomputed at close()), it
  // just records the movement so it factors into that later recalculation.
  const addCashMovement = useCallback(
    async ({ type, amount_usd, amount_khr, reason }) => {
      if (!shift) return null;
      setRecordingMovement(true);
      try {
        const res = await addCashMovementApi(shift.id, {
          type,
          amount_usd,
          amount_khr,
          reason,
        });
        return res.data.movement;
      } finally {
        setRecordingMovement(false);
      }
    },
    [shift],
  );

  return {
    shift,
    loading,
    fetchError,
    opening,
    closing,
    closeSummary,
    openShift,
    closeShift,
    dismissCloseSummary,
    refreshShift: fetchCurrent,
    addCashMovement,
    recordingMovement,
  };
}

export default useCashierShift;
