import { useState, useEffect, useCallback } from "react";
import { fetchTables } from "../api/tableApi";

/**
 * Custom hook for table selection and loading.
 * New orders can only pick available tables, while re-order flows can keep the current occupied table selected explicitly.
 */
export function useTableSelection(initialSelectedTableId = null, options = {}) {
  const { allowOccupiedTables = false } = options;
  const [selectedTableId, setSelectedTableId] = useState(initialSelectedTableId);
  const [tableOptions, setTableOptions] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  useEffect(() => {
    if (initialSelectedTableId !== null) {
      setSelectedTableId(initialSelectedTableId);
      return;
    }

    if (!allowOccupiedTables) {
      setSelectedTableId(null);
    }
  }, [initialSelectedTableId, allowOccupiedTables]);

  /**
   * Load available tables from API
   */
  const loadTables = useCallback(async () => {
    setTableLoading(true);
    setTableError("");
    try {
      const response = await fetchTables();
      setTableOptions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load tables", error);
      setTableError("Failed to load tables");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  /**
   * Only available tables are selectable for new orders.
   */
  const getAvailableTables = useCallback(
    () => tableOptions.filter((table) => table.status === "available"),
    [tableOptions],
  );

  /**
   * A re-order flow may keep the current occupied table selected, but other active tables remain blocked.
   */
  const getBlockedTables = useCallback(() => {
    if (allowOccupiedTables) {
      return tableOptions.filter(
        (table) =>
          table.status !== "available" &&
          String(table.id) !== String(selectedTableId),
      );
    }

    return tableOptions.filter((table) => table.status !== "available");
  }, [allowOccupiedTables, selectedTableId, tableOptions]);

  const isTableSelectable = useCallback(
    (table) => {
      if (!table) return false;

      if (table.status === "available") {
        return true;
      }

      if (allowOccupiedTables) {
        return String(table.id) === String(selectedTableId);
      }

      return false;
    },
    [allowOccupiedTables, selectedTableId],
  );

  const selectTable = useCallback(
    (tableId, force = false) => {
      if (!tableId) {
        setSelectedTableId(null);
        return;
      }

      const table = tableOptions.find(
        (candidate) => String(candidate.id) === String(tableId),
      );

      if (!table || (!force && !isTableSelectable(table))) {
        return;
      }

      setSelectedTableId(tableId);
    },
    [isTableSelectable, tableOptions],
  );

  /**
   * Clear table selection
   */
  const clearSelection = () => setSelectedTableId(null);

  /**
   * Get selected table details
   */
  const getSelectedTable = () =>
    tableOptions.find((table) => String(table.id) === String(selectedTableId));

  return {
    selectedTableId,
    setSelectedTableId: selectTable,
    tableOptions,
    tableLoading,
    tableError,
    getAvailableTables,
    getBlockedTables,
    isTableSelectable,
    clearSelection,
    getSelectedTable,
    refreshTables: loadTables,
  };
}
