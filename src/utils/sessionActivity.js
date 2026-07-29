// Single source of truth for "how long can this session sit unattended
// before it's no longer trusted" - shared between the in-tab idle lock
// (useIdleLogout.js, tab stays open) and the closed-tab staleness check
// (AppRouter.jsx, tab was fully closed/reopened) so the two don't drift
// apart into two different timeouts that mean the same thing.
export const IDLE_TIMEOUT_MS = {
  cashier: 10 * 60 * 1000,
  admin: 20 * 60 * 1000,
};

const LAST_ACTIVE_KEY = "lastActiveAt";

export function getIdleTimeoutMs(role) {
  return IDLE_TIMEOUT_MS[role] ?? IDLE_TIMEOUT_MS.cashier;
}

// Called on real user activity, on login/unlock, and right before the tab
// is hidden/closed - records the last moment this tab was known to be in
// use so a later app load can tell how long it's actually been gone.
export function markActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
}

export function clearActivity() {
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

// True once the gap since the last recorded activity exceeds this role's
// idle timeout - covers the case the in-tab idle lock can't: the tab (and
// its running JS) was closed entirely rather than left open and ignored, so
// no lock screen ever got a chance to show. A missing timestamp (e.g. an
// existing session from before this feature shipped) isn't punished as
// stale - it's just backfilled to now, so it only starts counting from
// this point forward instead of mass-logging-out everyone already active.
export function isSessionStale(role) {
  const lastActive = Number(localStorage.getItem(LAST_ACTIVE_KEY));
  if (!lastActive) {
    markActivity();
    return false;
  }
  return Date.now() - lastActive > getIdleTimeoutMs(role);
}
