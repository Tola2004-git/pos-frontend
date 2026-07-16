import apiClient from "./apiClient";

export const getUsers = (search = "", role = "all", page = 1) =>
  apiClient.get(`/users?search=${search}&role=${role}&page=${page}`);

export const getAllCashiers = () =>
  apiClient.get(`/users?role=cashier&per_page=200`);

export const createUser = (data) => apiClient.post("/users", data);
export const updateUser = (id, data) => apiClient.put(`/users/${id}`, data);
export const deleteUser = (id) => apiClient.delete(`/users/${id}`);
export default apiClient;
