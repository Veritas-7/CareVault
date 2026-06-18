import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");

type BootErrorBoundaryState = {
  error: unknown;
};

class BootErrorBoundary extends React.Component<React.PropsWithChildren, BootErrorBoundaryState> {
  state: BootErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): BootErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: unknown) {
    renderBootError(error);
  }

  override render() {
    if (this.state.error) {
      return null;
    }

    return this.props.children;
  }
}

function formatBootError(error: unknown) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  return "Unknown boot error";
}

function renderBootError(error: unknown) {
  if (!rootElement) return;

  const container = document.createElement("div");
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  container.style.padding = "32px";
  container.style.color = "#10201f";

  const title = document.createElement("h1");
  title.textContent = "CareVault startup failed";
  title.style.fontSize = "24px";
  title.style.margin = "0 0 12px";

  const detail = document.createElement("pre");
  detail.textContent = formatBootError(error);
  detail.style.whiteSpace = "pre-wrap";
  detail.style.background = "#fff5f5";
  detail.style.border = "1px solid #fecaca";
  detail.style.borderRadius = "8px";
  detail.style.padding = "16px";

  container.append(title, detail);
  rootElement.replaceChildren(container);
}

window.addEventListener("error", (event) => {
  renderBootError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  renderBootError(event.reason);
});

try {
  if (!rootElement) throw new Error("Missing #root element");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BootErrorBoundary>
        <App />
      </BootErrorBoundary>
    </React.StrictMode>,
  );
} catch (error) {
  renderBootError(error);
}
