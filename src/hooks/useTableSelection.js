import { useState, useEffect } from "react";
import { fetchTables } from "../api/tableApi";

/**
 * Custom hook for table selection and loading
 * Handles fetching available tables and managing table selection state
 */
export function useTableSelection(initialSelectedTableId = null) {
  const [selectedTableId, setSelectedTableId] = useState(initialSelectedTableId);
  const [tableOptions, setTableOptions] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  useEffect(() => {
    if (initialSelectedTableId !== null) {
      setSelectedTableId(initialSelectedTableId);
    }
  }, [initialSelectedTableId]);

  /**
   * Load available tables from API
   */
  useEffect(() => {
    const loadTables = async () => {
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
    };

    loadTables();
  }, []);

  /**
   * Get available tables (filtered by status)
   */
  const getAvailableTables = () =>
    tableOptions.filter((table) => {
      if (table.status === "available") {
        return true;
      }
      if (!selectedTableId) {
        return false;
      }
      return table.id === selectedTableId;
    });

  /**
   * Clear table selection
   */
  const clearSelection = () => setSelectedTableId(null);

  /**
   * Get selected table details
   */
  const getSelectedTable = () =>
    tableOptions.find((table) => table.id === selectedTableId);

  return {
    selectedTableId,
    setSelectedTableId,
    tableOptions,
    tableLoading,
    tableError,
    getAvailableTables,
    clearSelection,
    getSelectedTable,
  };
}
