import apiClient from "./apiClient";
export const getUsers = (search = "", role = "all", page = 1) =>
  api.get(`/users?search=${search}&role=${role}&page=${page}`);

export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export default api;
