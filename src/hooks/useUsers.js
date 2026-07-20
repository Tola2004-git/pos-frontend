import { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient.js";
import { getUsers, createUser, updateUser, deleteUser } from "../api/usersApi.js";
import { checkPasswordStrength, compressImage } from "../utils/userHelpers.js";
import {
  alertSuccess,
  alertError,
  alertConfirmDelete,
} from "../utils/alert.jsx";
import { isValidEmail } from "../utils/userHelpers.js";
import { useTranslations } from "./useTranslations";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
  profile_image: "",
};

const defaultStrength = { score: 0, label: "", color: "" };

export function useUsers() {
  const { t } = useTranslations();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(defaultStrength);
  const [focusedField, setFocusedField] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  useEffect(() => {
    apiClient
      .get("/me")
      .then((res) => setCurrentUser(res.data))
      .catch((err) => console.error("Failed to fetch current user:", err));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(search, roleFilter, page);
      console.log("Full Response: ", res.data);
      setUsers(res.data.data || res.data);
      setTotal(res.data.total || 0);
      setLastPage(res.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handlePasswordChange = (value) => {
    setForm((prev) => ({ ...prev, password: value }));
    setPasswordStrength(checkPasswordStrength(value, t));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setForm((prev) => ({ ...prev, profile_image: base64 }));
    } catch (err) {
      console.error("Compression error:", err);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!isValidEmail(form.email)) {
      alertError(t.invalidEmailTitle, t.invalidEmailMsg);
      return;
    }
    if (!editUser && passwordStrength.score < 3) {
      alertError(t.weakPasswordTitle, t.weakPasswordMsg);
      return;
    }
    setSubmitting(true);
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        alertSuccess(t.tableUpdatedTitle, t.userUpdatedMsg);
      } else {
        await createUser(form);
        alertSuccess(t.tableCreatedTitle, t.userCreatedMsg);
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      alertError(
        t.genericErrorTitle,
        err.response?.data?.message || t.tryAgainMsg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (user) => {
    setForm(defaultForm);
    setEditUser(user);
    setError("");
    setModalLoading(true);
    setShowModal(true);
    await new Promise((r) => setTimeout(r, 500));
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role || "cashier",
      profile_image: user.profile_image || "",
    });
    setPasswordStrength(defaultStrength);
    setModalLoading(false);
  };

  const handleDelete = async (id) => {
    const result = await alertConfirmDelete(
      t.userDeleteConfirmTitle,
      t.ingredientDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;
    try {
      await deleteUser(id);
      alertSuccess(t.tableDeletedTitle, t.userDeletedMsg);
      fetchUsers();
    } catch (err) {
      alertError(
        t.ingredientDeleteFailedTitle,
        err.response?.data?.message || t.tryAgainMsg,
      );
    }
  };

  const openAddModal = () => {
    setForm(defaultForm);
    setEditUser(null);
    setError("");
    setPasswordStrength(defaultStrength);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
  };

  return {
    users,
    currentUser,
    search,
    loading,
    page,
    total,
    lastPage,
    roleFilter,
    showRoleDropdown,
    dropdownRef,
    showModal,
    modalLoading,
    editUser,
    submitting,
    form,
    setForm,
    error,
    showPassword,
    passwordStrength,
    focusedField,
    setPage,
    setSearch: handleSearchChange,
    setRoleFilter,
    setShowRoleDropdown,
    setShowPassword,
    setFocusedField,
    handlePasswordChange,
    handleImageUpload,
    handleSubmit,
    handleEdit,
    handleDelete,
    openAddModal,
    closeModal,
  };
}
