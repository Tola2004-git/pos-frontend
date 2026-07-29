import { useEffect, useRef } from "react";
import { getIdleTimeoutMs, markActivity } from "../utils/sessionActivity";

const WARNING_BEFORE_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousedown", "mousemove", "keydown", "touchstart", "wheel", "scroll"];
// Activity fires very frequently (mousemove/scroll) - only rearm the timers
// (and rewrite the activity timestamp) at most once per second instead of
// on every single event.
const RESET_THROTTLE_MS = 1000;

// Fires onWarning ~1 minute before the idle deadline and onTimeout once it's
// reached; the caller decides what "timed out" actually means (lock screen,
// hard logout, etc.) - this hook only tracks activity vs. silence. It also
// keeps sessionActivity's "last seen" timestamp fresh, which is what lets
// AppRouter detect a tab that was closed (not just left idle) past the
// same timeout.
export function useIdleLogout({ enabled, onWarning, onTimeout }) {
  const onWarningRef = useRef(onWarning);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onWarningRef.current = onWarning;
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const role = localStorage.getItem("role");
    const timeoutMs = getIdleTimeoutMs(role);

    let warnTimer;
    let timeoutTimer;
    let lastReset = 0;

    const scheduleTimers = () => {
      clearTimeout(warnTimer);
      clearTimeout(timeoutTimer);
      warnTimer = setTimeout(() => onWarningRef.current(), Math.max(timeoutMs - WARNING_BEFORE_MS, 0));
      timeoutTimer = setTimeout(() => onTimeoutRef.current(), timeoutMs);
    };

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset < RESET_THROTTLE_MS) return;
      lastReset = now;
      markActivity();
      scheduleTimers();
    };

    // Right before the tab is hidden or actually closed, so a later app
    // load can measure the real gap instead of the last throttled tick.
    const handleVisibilityOrClose = () => {
      if (document.visibilityState === "hidden") markActivity();
    };

    markActivity();
    scheduleTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibilityOrClose);
    window.addEventListener("pagehide", markActivity);

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(timeoutTimer);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibilityOrClose);
      window.removeEventListener("pagehide", markActivity);
    };
  }, [enabled]);
}
