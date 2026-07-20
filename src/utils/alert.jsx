import ReactDOMServer from "react-dom/server";
import {
  ArrowRight,
  Trash,
  TickCircle,
  InfoCircle,
  Danger,
} from "iconsax-react";
// ─── Toast & Confirm System (No external dependency) ─────────────────────────
// Usage:
//   alertSuccess("Title", "Message")
//   alertError("Title", "Message")
//   alertWarning("Title", "Message")
//   alertInfo("Title", "Message")
//   const result = await alertConfirmDelete("Title", "Message")
//   → result.isConfirmed = true / false

// ─── Inject Global Styles Once ───────────────────────────────────────────────

function injectAlertStyles() {
  if (document.getElementById("custom-alert-styles")) return;
  const style = document.createElement("style");
  style.id = "custom-alert-styles";
  style.textContent = `
    #toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      border-radius: 16px;
      min-width: 300px;
      max-width: 380px;
      color: white;
      font-family: inherit;
      animation: toast-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }

    .toast-item.toast-success { background: linear-gradient(135deg, #27ae60, #1e8449); border: 1px solid rgba(255,255,255,0.15); }
    .toast-item.toast-error   { background: linear-gradient(135deg, #e74c3c, #c0392b); border: 1px solid rgba(255,255,255,0.15); }
    .toast-item.toast-warning { background: linear-gradient(135deg, #f39c12, #d68910); border: 1px solid rgba(255,255,255,0.15); }
    .toast-item.toast-info    { background: linear-gradient(135deg, #2980b9, #1a5276); border: 1px solid rgba(255,255,255,0.15); }

    .toast-item::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: rgba(255,255,255,0.3);
      border-radius: 16px 16px 0 0;
    }

    .toast-item.toast-hiding {
      animation: toast-out 0.3s ease forwards;
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
      width: 22px;
      height: 22px;
      opacity: 0.95;
    }

    .toast-body { flex: 1; }

    .toast-title {
      font-weight: 700;
      font-size: 0.9rem;
      margin: 0 0 3px 0;
      color: rgba(255,255,255,0.95);
    }

    .toast-message {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.85);
      margin: 0;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255,255,255,0.35);
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .toast-close:hover { color: rgba(255,255,255,0.8); }

    .toast-progress {
      position: absolute;
      bottom: 0; left: 0;
      height: 3px;
      border-radius: 0 0 16px 16px;
      background: rgba(255,255,255,0.5);
      animation: toast-progress linear forwards;
    }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999998;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      animation: confirm-fade-in 0.2s ease forwards;
    }

    .confirm-box {
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      background: rgba(255, 255, 255, 0.0);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 36px 32px 28px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      color: white;
      font-family: inherit;
      animation: confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .confirm-emoji {
      font-size: 3rem;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: confirm-bounce 0.6s ease;
    }

    .confirm-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0 0 10px;
      color: rgba(255,255,255,0.95);
    }

    .confirm-message {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.55);
      margin: 0 0 28px;
      line-height: 1.5;
    }

    .confirm-buttons {
      display: flex;
      gap: 12px;
    }

    .confirm-btn {
      flex: 1;
      padding: 12px;
      border-radius: 12px;
      border: none;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
      font-family: inherit;
    }
    .confirm-btn:hover  { transform: translateY(-1px); opacity: 0.9; }
    .confirm-btn:active { transform: translateY(0px);  opacity: 1; }

    .confirm-btn-cancel {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.7);
    }

    .confirm-btn-danger {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      box-shadow: 0 4px 16px rgba(231,76,60,0.4);
    }

    .confirm-btn-warning {
      background: linear-gradient(135deg, #f39c12, #d68910);
      color: white;
      box-shadow: 0 4px 16px rgba(243,156,18,0.4);
    }

    .confirm-input {
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
      min-height: 70px;
      margin-bottom: 20px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.07);
      color: white;
      font-size: 0.85rem;
      font-family: inherit;
      outline: none;
      text-align: left;
    }
    .confirm-input::placeholder {
      color: rgba(255,255,255,0.35);
    }

    .confirm-input-error {
      color: #e67e22;
      font-size: 0.78rem;
      margin: -14px 0 16px;
      text-align: left;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateX(60px) scale(0.9); }
      to   { opacity: 1; transform: translateX(0)    scale(1);   }
    }
    @keyframes toast-out {
      from { opacity: 1; transform: translateX(0)    scale(1);   max-height: 200px; margin-bottom: 0; }
      to   { opacity: 0; transform: translateX(60px) scale(0.9); max-height: 0;     margin-bottom: -12px; }
    }
    @keyframes toast-progress {
      from { width: 100%; }
      to   { width: 0%; }
    }
    @keyframes confirm-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes confirm-pop {
      from { opacity: 0; transform: scale(0.85) translateY(20px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);    }
    }
    @keyframes confirm-bounce {
      0%, 100% { transform: translateY(0); }
      40%      { transform: translateY(-10px); }
      70%      { transform: translateY(-4px); }
    }
  `;
  document.head.appendChild(style);
}

function getContainer() {
  let el = document.getElementById("toast-container");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-container";
    document.body.appendChild(el);
  }
  return el;
}

const toSvgString = (icon) => {
  return ReactDOMServer.renderToStaticMarkup(icon);
};

const ICONS = {
  success: toSvgString(<TickCircle size="22" variant="Bulk" color="white" />),
  error: toSvgString(<Danger size="22" variant="Bulk" color="white" />),
  warning: toSvgString(<Danger size="22" variant="Bulk" color="white" />),
  info: toSvgString(<InfoCircle size="22" variant="Bulk" color="white" />),
  trash: toSvgString(<Trash size="50" variant="Bulk" color="white" />),
  arrowRight: toSvgString(<ArrowRight size="50" variant="Bulk" color="white" />),
  confirmWarning: toSvgString(<Danger size="50" variant="Bulk" color="white" />),
};

function showToast(type, title, message, duration = 3500) {
  injectAlertStyles();
  const container = getContainer();

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${ICONS[type]}</span>
    <div class="toast-body">
      <p class="toast-title">${title}</p>
      ${message ? `<p class="toast-message">${message}</p>` : ""}
    </div>
    <button class="toast-close" aria-label="Close">✕</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  const dismiss = () => {
    toast.classList.add("toast-hiding");
    toast.addEventListener("animationend", () => toast.remove(), {
      once: true,
    });
  };

  toast.querySelector(".toast-close").addEventListener("click", dismiss);
  setTimeout(dismiss, duration);
}

function showConfirm({
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  icon = ICONS.trash,
  variant = "danger",
}) {
  injectAlertStyles();

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-emoji">${icon}</span>
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-message">${message}</p>
        <div class="confirm-buttons">
          <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
          <button class="confirm-btn confirm-btn-${variant}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = (confirmed) => {
      overlay.style.animation = "confirm-fade-in 0.2s ease reverse forwards";
      setTimeout(() => {
        overlay.remove();
        resolve({ isConfirmed: confirmed });
      }, 200);
    };

    overlay
      .querySelector(".confirm-btn-cancel")
      .addEventListener("click", () => close(false));
    overlay
      .querySelector(`.confirm-btn-${variant}`)
      .addEventListener("click", () => close(true));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
  });
}

function showPrompt({
  title,
  message,
  placeholder = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = ICONS.confirmWarning,
  variant = "danger",
  requiredMessage = "This field is required.",
}) {
  injectAlertStyles();

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";
    overlay.innerHTML = `
      <div class="confirm-box">
        <span class="confirm-emoji">${icon}</span>
        <h3 class="confirm-title">${title}</h3>
        <p class="confirm-message">${message}</p>
        <textarea class="confirm-input" placeholder="${placeholder}"></textarea>
        <p class="confirm-input-error" style="display:none;">${requiredMessage}</p>
        <div class="confirm-buttons">
          <button class="confirm-btn confirm-btn-cancel">${cancelText}</button>
          <button class="confirm-btn confirm-btn-${variant}">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input = overlay.querySelector(".confirm-input");
    const errorEl = overlay.querySelector(".confirm-input-error");
    input.focus();

    const close = (confirmed, value) => {
      overlay.style.animation = "confirm-fade-in 0.2s ease reverse forwards";
      setTimeout(() => {
        overlay.remove();
        resolve({ isConfirmed: confirmed, value });
      }, 200);
    };

    overlay
      .querySelector(".confirm-btn-cancel")
      .addEventListener("click", () => close(false, ""));
    overlay
      .querySelector(`.confirm-btn-${variant}`)
      .addEventListener("click", () => {
        const value = input.value.trim();
        if (!value) {
          errorEl.style.display = "block";
          input.focus();
          return;
        }
        close(true, value);
      });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false, "");
    });
  });
}

export const alertPromptDanger = (
  title,
  message,
  placeholder,
  confirmText = "Confirm",
  cancelText = "Cancel",
) =>
  showPrompt({
    title,
    message,
    placeholder,
    confirmText,
    cancelText,
    icon: ICONS.confirmWarning,
    variant: "danger",
  });

export const alertSuccess = (title, message) =>
  showToast("success", title, message);
export const alertError = (title, message) =>
  showToast("error", title, message);
export const alertWarning = (title, message) =>
  showToast("warning", title, message);
export const alertInfo = (title, message) => showToast("info", title, message);

export const alertConfirmDelete = (
  title,
  message,
  cancelText = "Cancel",
  confirmText = "Delete",
) =>
  showConfirm({
    title,
    message,
    confirmText,
    cancelText,
    icon: ICONS.trash,
    variant: "danger",
  });

export const alertConfirm = (
  title,
  message,
  confirmText = "Confirm",
  icon = ICONS.arrowRight,
  cancelText = "Cancel",
) =>
  showConfirm({
    title,
    message,
    confirmText,
    cancelText,
    icon,
    variant: "danger",
  });

export const alertConfirmWarning = (
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
) =>
  showConfirm({
    title,
    message,
    confirmText,
    cancelText,
    icon: ICONS.confirmWarning,
    variant: "warning",
  });
