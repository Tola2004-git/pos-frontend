import apiClient from "./apiClient";

export const fetchTables = () => api.get("/tables");
export const createTable = (data) => api.post("/tables", data);
export const updateTable = (id, data) => api.put(`/tables/${id}`, data);
export const clearTable = (table) => {
  const tableData = typeof table === "object" && table !== null ? table : {};

  return updateTable(tableData.id, {
    name: tableData.name || "",
    capacity: tableData.capacity ?? null,
    note: tableData.note || "",
    status: "available",
  });
};
export const deleteTable = (id) => api.delete(`/tables/${id}`);
