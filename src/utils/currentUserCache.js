// Every page wraps itself in <Layout> (or <CashierLayout>) independently,
// so React Router remounts that wrapper on every navigation - without this
// cache, the wrapper's own `user` state would reset to null on each click,
// flashing the "Admin/Admin" placeholder before /me resolves again. Caching
// the last-known user at module scope survives those remounts (it only
// resets on a full page reload or logout), so navigation reuses it instead
// of re-flashing.
let cachedUser = null;

export function getCachedUser() {
  return cachedUser;
}

export function setCachedUser(user) {
  cachedUser = user;
}

export function clearCachedUser() {
  cachedUser = null;
}
