import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "@/shared/lib/sentry";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";

// Initialize error tracking
initSentry();

createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
