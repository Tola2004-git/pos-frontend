import { useState } from "react";

const initialFormState = {
  name: "",
  icon: "",
  description: "",
  bank_name: "",
  account_number: "",
  account_name: "",
  status: true,
};

export const usePaymentForm = () => {
  const [form, setForm] = useState(initialFormState);
  const [editMethod, setEditMethod] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);

  const closeModal = () => {
    setShowModal(false);
    setEditMethod(null);
    setViewMode(false);
    setError("");
    setForm(initialFormState);
  };

  const setFormError = (errorMsg) => {
    setError(errorMsg);
  };

  const clearError = () => {
    setError("");
  };

  const loadMethodForEdit = (method) => {
    setViewMode(false);
    setEditMethod(method);
    setForm({
      name: method.name,
      icon: method.icon || "",
      description: method.description || "",
      bank_name: method.bank_name || "",
      account_number: method.account_number || "",
      account_name: method.account_name || "",
      status: method.status,
    });
    setShowModal(true);
  };

  const loadMethodForView = (method) => {
    setViewMode(true);
    setEditMethod(method);
    setForm({
      name: method.name,
      icon: method.icon || "",
      description: method.description || "",
      bank_name: method.bank_name || "",
      account_number: method.account_number || "",
      account_name: method.account_name || "",
      status: method.status,
    });
    setShowModal(true);
  };

  const updateFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditMethod(null);
    setError("");
  };

  return {
    form,
    setForm,
    editMethod,
    setEditMethod,
    viewMode,
    error,
    showModal,
    openModal,
    closeModal,
    setFormError,
    clearError,
    loadMethodForEdit,
    loadMethodForView,
    updateFormField,
    resetForm,
  };
};
