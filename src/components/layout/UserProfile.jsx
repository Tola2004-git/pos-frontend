import { colors } from "../../utils/styles";

function UserProfile({ user, t }) {
  const initial = user?.name?.charAt(0).toUpperCase() || "A";
  const roleLabel =
    user?.role === "cashier" ? t?.roleCashier : t?.roleAdmin;

  return (
    <div className="flex items-center gap-[10px]">
      {user?.profile_image ? (
        <img
          src={user.profile_image}
          alt="profile"
          style={{ borderColor: colors.white }}
          className="w-9 h-9 rounded-full object-cover border-2"
        />
      ) : (
        <div
          style={{ borderColor: colors.white }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[0.9rem] border-2"
        >
          {initial}
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-white text-[0.85rem] font-semibold leading-[1.2]">
          {user?.name || t?.roleAdmin || "Admin"}
        </span>
        <span
          style={{ color: colors.white }}
          className="text-[0.72rem] font-medium"
        >
          {roleLabel || "Admin"}
        </span>
      </div>
    </div>
  );
}

export default UserProfile;
