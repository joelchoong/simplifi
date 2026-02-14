/**
 * Sentry Error Tracking Configuration
 * 
 * This module initializes Sentry for production error monitoring and reporting.
 * Sentry captures errors, performance data, and user feedback to help debug issues.
 */
import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking
 * Only enabled in production or when explicitly enabled in development
 */
export function initSentry() {
    const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
    const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;
    const enableErrorReporting = import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true";

    // Only initialize if DSN is provided and error reporting is enabled
    if (!sentryDsn) {
        console.warn("⚠️ Sentry DSN not configured. Error tracking is disabled.");
        return;
    }

    // Skip initialization in development unless explicitly enabled
    if (environment === "development" && !enableErrorReporting) {
        console.warn("⚠️ Sentry disabled in development. Set VITE_ENABLE_ERROR_REPORTING=true to enable.");
        return;
    }

    Sentry.init({
        dsn: sentryDsn,
        environment,

        // Set sample rate for performance monitoring (10% in production)
        tracesSampleRate: environment === "production" ? 0.1 : 1.0,

        // Capture 100% of errors
        sampleRate: 1.0,

        // Enable automatic error tracking
        integrations: [
            // Basic integrations are included by default
        ],

        // Filter out non-errors and expected errors
        beforeSend(event, hint) {
            const error = hint.originalException;

            // Don't send errors from browser extensions
            if (error && typeof error === "object" && "message" in error) {
                const message = String(error.message);
                if (message.includes("chrome-extension://") || message.includes("moz-extension://")) {
                    return null;
                }
            }

            // Don't send network errors from ad blockers
            if (event.exception?.values?.[0]?.value?.includes("Failed to fetch")) {
                return null;
            }

            return event;
        },
    });

    console.log("✅ Sentry error tracking initialized");
}

/**
 * Set user context for error tracking
 * Call this after user authentication
 */
export function setSentryUser(userId: string, email?: string) {
    Sentry.setUser({
        id: userId,
        email: email,
    });
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
    Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setSentryContext(key: string, value: Record<string, any>) {
    Sentry.setContext(key, value);
}

/**
 * Manually capture an error
 */
export function captureError(error: Error, context?: Record<string, any>) {
    if (context) {
        Sentry.withScope((scope) => {
            Object.entries(context).forEach(([key, value]) => {
                scope.setExtra(key, value);
            });
            Sentry.captureException(error);
        });
    } else {
        Sentry.captureException(error);
    }
}

/**
 * Capture a message (for non-error tracking)
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
    Sentry.captureMessage(message, level);
}
