import { useState, useEffect, useCallback } from "react";
import { fetchShiftsApi, fetchShiftApi, reviewShiftApi } from "../api/shiftApi";

export function useShiftReview() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reviewingShift, setReviewingShift] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchShiftsApi({ status: statusFilter, page });
      setShifts(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Failed to fetch shifts", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // The list row (from fetchShiftsApi) doesn't include cashMovements - fetch
  // the full shift detail so the review modal can show them. Falls back to
  // the row itself if that fetch fails, so review still works.
  const openReview = async (shift) => {
    setReviewingShift(shift);
    try {
      const res = await fetchShiftApi(shift.id);
      setReviewingShift(res.data);
    } catch (err) {
      console.error("Failed to fetch shift detail", err);
    }
  };
  const closeReview = () => setReviewingShift(null);

  const submitReview = async (reviewNote) => {
    if (!reviewingShift) return;
    setSubmitting(true);
    try {
      await reviewShiftApi(reviewingShift.id, { review_note: reviewNote || null });
      closeReview();
      await fetchShifts();
    } finally {
      setSubmitting(false);
    }
  };

  return {
    shifts,
    loading,
    statusFilter,
    setStatusFilter: (v) => {
      setStatusFilter(v);
      setPage(1);
    },
    page,
    setPage,
    lastPage,
    total,
    reviewingShift,
    openReview,
    closeReview,
    submitting,
    submitReview,
  };
}

export default useShiftReview;
