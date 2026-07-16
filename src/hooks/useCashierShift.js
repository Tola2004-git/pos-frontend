import { useState, useEffect, useCallback } from "react";
import { fetchCurrentShiftApi, openShiftApi, closeShiftApi } from "../api/shiftApi";

// Tracks the logged-in cashier's open shift (cash-drawer session). A
// cashier must open one (with a starting cash float) before selling, and
// closing one records a counted-cash total that the backend reconciles
// against actual cash sales rung up during the shift window.
export function useCashierShift() {
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  // Distinguishes "confirmed no open shift" from "couldn't check" - without
  // this, a transient network/auth failure on the status check would look
  // identical to "no shift" and wrongly prompt to open a duplicate one even
  // though the cashier may already have one open server-side.
  const [fetchError, setFetchError] = useState(false);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeSummary, setCloseSummary] = useState(null);

  const fetchCurrent = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetchCurrentShiftApi();
      setShift(res.data.shift || null);
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
      setShift(res.data.shift);
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
        setShift(null);
        return res.data.shift;
      } finally {
        setClosing(false);
      }
    },
    [shift],
  );

  const dismissCloseSummary = useCallback(() => setCloseSummary(null), []);

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
  };
}

export default useCashierShift;
