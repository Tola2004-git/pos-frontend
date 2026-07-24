import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// Module-level singleton - React.StrictMode double-invokes effects in dev
// (mount -> cleanup -> mount again) to surface non-idempotent effects. If
// initRealtimeSync() created a fresh Echo/WebSocket on every call, that fake
// first cleanup would call echo.disconnect() while the socket was still
// mid-handshake ("WebSocket is closed before the connection is established"),
// and the real connection only every second render was iffy in comparison.
// Keeping one instance across the module's lifetime means repeated calls
// (StrictMode, or any other remount) just reuse the same live connection.
let sharedEcho = null;

// Subscribes once, app-wide, to the backend's public "pos-updates" channel
// (see App\Events\OrderChanged / TableChanged / ShiftChanged) and
// re-dispatches the exact same window events that useOrders.js / useTables.js
// / useDashboard.js already listen for after a local Hold/Move/Clear/Shift
// action. That means every page built on those hooks - admin and cashier
// alike - picks up changes made by anyone else in real time, without each
// page needing its own Echo wiring.
export function initRealtimeSync() {
  if (sharedEcho) return sharedEcho;

  sharedEcho = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT || 80,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "https") === "https",
    enabledTransports: ["ws", "wss"],
  });

  sharedEcho
    .channel("pos-updates")
    .listen(".order.changed", () => {
      window.dispatchEvent(new CustomEvent("orders:refresh"));
    })
    .listen(".table.changed", () => {
      window.dispatchEvent(new CustomEvent("tables:refresh"));
    })
    .listen(".shift.changed", () => {
      window.dispatchEvent(new CustomEvent("shifts:refresh"));
    });

  return sharedEcho;
}
