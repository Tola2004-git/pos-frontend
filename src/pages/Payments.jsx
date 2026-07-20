import { useState, useContext } from "react";
import Layout from "../components/layout/Layout.jsx";
import { SidebarContext } from "../App.jsx";
import { glass } from "../utils/styles.js";
import { RiAddLine } from "react-icons/ri";
import PaymentMethodCard from "../components/payment/PaymentMethodCard.jsx";
import PaymentMethodModal from "../components/payment/PaymentMethodModal.jsx";
import { usePaymentMethods } from "../hooks/usePaymentMethods.js";
import { usePaymentForm } from "../hooks/usePaymentForm.js";
import { DEFAULT_METHODS } from "../constants/paymentConstants.js";
import { Add, Card, Minus } from "iconsax-react";
import { alertSuccess, alertError } from "../utils/alert.jsx";
import { PaymentMethodSkeletonCard } from "../components/ui/SkeletonPayment.jsx";
import { useTranslations } from "../hooks/useTranslations";

function PaymentMethods() {
  const { t } = useTranslations();
  const {
    methods,
    loading,
    fetchMethods,
    createMethod,
    updateMethod,
    toggleStatus: toggleStatusHook,
    deleteMethod,
  } = usePaymentMethods();
  const {
    form,
    editMethod,
    viewMode,
    error,
    showModal,
    openModal,
    closeModal,
    setFormError,
    loadMethodForEdit,
    loadMethodForView,
    updateFormField,
  } = usePaymentForm();

  const { sidebarOpen } = useContext(SidebarContext);
  const [submitting, setSubmitting] = useState(false);
  const SkeletonCount = sidebarOpen ? 6 : 8;
  const visibleMethods = methods.filter((method) => {
    const methodName = method?.name?.toLowerCase();
    return methodName !== "cash";
  });

  const handleSubmit = async () => {
    if (!form.name) {
      setFormError(t.paymentNameRequiredMsg);
      return;
    }
    setSubmitting(true);
    const result = editMethod
      ? await updateMethod(editMethod.id, form)
      : await createMethod(form);
    setSubmitting(false);

    if (result.success) {
      alertSuccess(
        editMethod ? t.paymentUpdatedTitle : t.paymentCreatedTitle,
        editMethod ? t.paymentUpdatedMsg : t.paymentCreatedMsg,
      );
      closeModal();
    } else {
      setFormError(result.error);
      alertError(t.genericErrorTitleShort, result.error);
    }
  };

  const handleDelete = async (id) => await deleteMethod(id);

  const handleToggleStatus = async (method) => await toggleStatusHook(method);

  const handleAddDefault = async (method) => await createMethod(method);

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Card size={40} color="white" variant="Outline" />
          </div>
          {t.paymentMethodsTitle}
        </h2>
        <button
          onClick={openModal}
          className="btn-shine-blue"
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Add size={18} color="white" variant="Outline" /> {t.addMethodAction}
        </button>
      </div>

      {methods.length === 0 && !loading && (
        <div
          style={{
            ...glass,
            borderRadius: "16px",
            padding: "40px 24px",
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <Card size={60} color="white" variant="TwoTone" />
          <div>
            <p
              style={{
                color: "white",
                fontWeight: 600,
                fontSize: "0.9rem",
                margin: "0 0 6px",
              }}
            >
              {t.noPaymentMethodsYetMsg}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              {t.addFirstMethodMsg}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {Array.from({ length: visibleMethods.length || SkeletonCount }).map(
            (_, index) => (
              <PaymentMethodSkeletonCard key={index} delay={index * 0.05} />
            ),
          )}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {visibleMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onEdit={loadMethodForEdit}
              onView={loadMethodForView}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              t={t}
            />
          ))}
        </div>
      )}

      <PaymentMethodModal
        showModal={showModal}
        editMethod={editMethod}
        viewMode={viewMode}
        form={form}
        error={error}
        onClose={closeModal}
        onFormChange={updateFormField}
        onSubmit={handleSubmit}
        submitting={submitting}
        t={t}
      />
    </Layout>
  );
}

export default PaymentMethods;
