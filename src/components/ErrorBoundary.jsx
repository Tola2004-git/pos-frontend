import { Component } from "react";

// Catches any render/lifecycle error anywhere below it so one broken
// component (a bad API response, a null field, etc.) shows a recoverable
// screen instead of unmounting the entire app to a blank white page -
// there was no error boundary anywhere in the app before this, so every
// uncaught error was a full-app crash. Deliberately has no dependency on
// translations/context/anything else that could itself be broken.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a1a2e",
            color: "#fff",
            fontFamily: "sans-serif",
            zIndex: 999999,
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "420px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem" }}>
              មានបញ្ហាកើតឡើង / Something went wrong
            </h2>
            <p style={{ opacity: 0.75, margin: "0 0 20px", fontSize: "0.9rem" }}>
              សូម Reload ទំព័រនេះម្ដងទៀត។ ទិន្នន័យរបស់អ្នកមិនត្រូវបានលុបទេ។
              <br />
              Please reload the page. Your data has not been lost.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(90deg, #2c5cc5, #4a7fe0)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 28px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
