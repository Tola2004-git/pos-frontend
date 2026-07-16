import apiClient from "./apiClient";

export const fetchTables = () => apiClient.get("/tables");
export const createTable = (data) => apiClient.post("/tables", data);
export const updateTable = (id, data) => apiClient.put(`/tables/${id}`, data);
export const clearTable = (table) => {
  const tableData = typeof table === "object" && table !== null ? table : {};
  return apiClient.post(`/tables/${tableData.id}/clear`);
};
export const deleteTable = (id) => apiClient.delete(`/tables/${id}`);
export const moveTableReservation = (fromId, targetTableId) =>
  apiClient.post(`/tables/${fromId}/move-reservation`, { target_table_id: targetTableId });

export default apiClient;
