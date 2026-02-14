import { Component, ReactNode, ErrorInfo } from "react";
import { captureError } from "@/shared/lib/sentry";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary Component
 * 
 * Catches errors in child components, reports to Sentry, and displays
 * a user-friendly error message instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to Sentry with component stack
        captureError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });

        // Also log to console in development
        if (import.meta.env.DEV) {
            console.error("Error caught by boundary:", error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/10 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-destructive" />
                                </div>
                                <CardTitle>Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                We're sorry, but something unexpected happened. The error has been
                                reported to our team and we'll look into it.
                            </p>

                            {import.meta.env.DEV && this.state.error && (
                                <div className="p-3 bg-destructive/5 rounded-md border border-destructive/20">
                                    <p className="text-xs font-mono text-destructive break-all">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleReset}
                                    variant="default"
                                    className="flex-1"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => (window.location.href = "/")}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Go Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
