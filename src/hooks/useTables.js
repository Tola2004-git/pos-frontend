import { useState, useEffect, useCallback } from "react";
import {
  fetchTables,
  createTable,
  updateTable,
  clearTable,
  deleteTable,
} from "../api/tableApi.js";
import { changeTableApi } from "../api/ordersApi.js";
import {
  alertSuccess,
  alertError,
  alertWarning,
  alertConfirmDelete,
} from "../utils/alert.jsx";

const initialForm = { name: "", capacity: null, note: "", status: "available" };

export function useTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [modalLoading, setModalLoading] = useState(false);

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTables();
      setTables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    const handleRefreshTables = () => {
      loadTables();
    };

    window.addEventListener("tables:refresh", handleRefreshTables);
    window.addEventListener("orders:refresh", handleRefreshTables);

    return () => {
      window.removeEventListener("tables:refresh", handleRefreshTables);
      window.removeEventListener("orders:refresh", handleRefreshTables);
    };
  }, [loadTables]);

  const openAdd = () => {
    setEditTable(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (table) => {
    setEditTable(table);
    setForm({
      name: table.name || "",
      capacity: table.capacity || null,
      note: table.notes || "",
      status: table.status || "available",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alertWarning("Missing Table Name", "Please enter a name before saving.");
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        ...form,
        status: form.status || "available",
      };

      if (editTable) {
        await updateTable(editTable.id, payload);
        alertSuccess("Updated!", "Table has been updated successfully.");
      } else {
        await createTable(payload);
        alertSuccess("Created!", "Table has been created successfully.");
      }
      setShowModal(false);
      loadTables();
    } catch (err) {
      alertError(
        "Save Failed",
        err.response?.data?.message || "Something went wrong!",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleClear = async (table) => {
    if (!table || !["occupied", "reserved"].includes(table.status)) return;

    try {
      await clearTable(table);
      alertSuccess("Cleared!", "Table has been reset to available.");
      loadTables();
    } catch (err) {
      alertError(
        "Clear Failed",
        err.response?.data?.message || "Unable to clear this table.",
      );
    }
  };

  const handleMove = async (fromTable, targetTableId) => {
    if (!fromTable || !["occupied", "reserved"].includes(fromTable.status)) return;

    const targetTable = tables.find((table) => table.id === targetTableId);
    if (!targetTable || targetTable.status !== "available") {
      alertWarning("Move unavailable", "Please choose an available table to move to.");
      return;
    }

    const orderId = fromTable.current_order?.id;

    try {
      if (orderId) {
        // Table has a live order (dine-in occupied, or a pending order holding a reserved
        // table) - route through the order's change-table endpoint so table_id/table_name
        // and both table statuses stay consistent.
        await changeTableApi(orderId, targetTable.id);
      } else {
        // Reserved with no order yet (e.g. a manual reservation set from the table modal) -
        // there's nothing to transfer, just move the reservation between the two tables.
        await Promise.all([
          updateTable(fromTable.id, {
            name: fromTable.name || "",
            capacity: fromTable.capacity ?? null,
            note: fromTable.notes || "",
            status: "available",
          }),
          updateTable(targetTable.id, {
            name: targetTable.name || "",
            capacity: targetTable.capacity ?? null,
            note: targetTable.notes || "",
            status: fromTable.status,
          }),
        ]);
      }

      alertSuccess("Moved!", `${fromTable.name} is now available and ${targetTable.name} is ${fromTable.status}.`);
      loadTables();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("orders:refresh"));
      }
    } catch (err) {
      alertError(
        "Move Failed",
        err.response?.data?.message || "Unable to move this table.",
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await alertConfirmDelete(
      "Delete this table?",
      "Do you really want to delete this table?",
    );
    if (!result.isConfirmed) return;

    try {
      await deleteTable(id);
      alertSuccess("Deleted!", "Table has been deleted successfully.");
      loadTables();
    } catch (err) {
      alertError(
        "Delete Failed",
        err.response?.data?.message || "Cannot delete this table!",
      );
    }
  };

  return {
    tables,
    loading,
    showModal,
    editTable,
    form,
    modalLoading,
    setForm,
    openAdd,
    openEdit,
    handleSave,
    handleClear,
    handleMove,
    handleDelete,
    setShowModal,
  };
}

export default useTables;
