import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
