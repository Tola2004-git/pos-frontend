import Layout from "../components/layout/Layout";
import { useUsers } from "../hooks/useUsers";
import UserSearch from "../components/users/UserSearch";
import UserTable from "../components/users/UserTable";
import UserModal from "../components/users/UserModal";
import { Profile2User, UserCirlceAdd } from "iconsax-react";

function Users() {
  const {
    users,
    search,
    loading,
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
    setSearch,
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
    page,
    setPage,
    total,
    lastPage,
  } = useUsers();

  return (
    <Layout>
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .floating-icon {
          width: 28px;
          animation: float 2s ease-in-out infinite;
          filter: brightness(0) invert(1);
        }
        .modal-icon {
          width: 40px;
          height: 40px;
          animation: float 2s ease-in-out infinite;
          will-change: transform;
          filter: brightness(0) invert(1);
        }
      `}</style>

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
            <Profile2User size={35} color="#fff" variant="bulk" />
          </div>
          Users Management
        </h2>

        <button
          onClick={openAddModal}
          className="btn-shine-blue"
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UserCirlceAdd size={25} color="#fff" variant="bulk" />
          Add User
        </button>
      </div>

      <UserSearch
        search={search}
        setSearch={setSearch}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        showRoleDropdown={showRoleDropdown}
        setShowRoleDropdown={setShowRoleDropdown}
        dropdownRef={dropdownRef}
      />

      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          padding: "0 4px",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          Total: {total} users
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === 1 ? "not-allowed" : "pointer",
              background:
                page === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
              color: page === 1 ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
            }}
          >
            Back
          </button>
          <span style={{ color: "white", fontWeight: 600, padding: "0 8px" }}>
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === lastPage ? "not-allowed" : "pointer",
              background:
                page === lastPage
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color: page === lastPage ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
            }}
          >
            Next
          </button>
        </div>
      </div>

      <UserModal
        showModal={showModal}
        modalLoading={modalLoading}
        editUser={editUser}
        submitting={submitting}
        form={form}
        setForm={setForm}
        error={error}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        passwordStrength={passwordStrength}
        focusedField={focusedField}
        setFocusedField={setFocusedField}
        handlePasswordChange={handlePasswordChange}
        handleImageUpload={handleImageUpload}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
      />
    </Layout>
  );
}

export default Users;
