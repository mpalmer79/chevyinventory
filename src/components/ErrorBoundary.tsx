// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Call optional error handler (for analytics/logging services)
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            margin: "20px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#ef4444",
              marginBottom: "8px",
            }}
          >
            Something went wrong
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#9ca3af",
              marginBottom: "20px",
              maxWidth: "400px",
              margin: "0 auto 20px",
            }}
          >
            An unexpected error occurred while loading this section. Please try
            again or refresh the page.
          </p>
          {this.state.error && (
            <details
              style={{
                textAlign: "left",
                background: "rgba(0, 0, 0, 0.2)",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                maxWidth: "500px",
                margin: "0 auto 20px",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  marginTop: "8px",
                  fontSize: "11px",
                  color: "#ef4444",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleRetry}
            style={{
              background: "#ef4444",
              color: "#ffffff",
              padding: "10px 24px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "#dc2626")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "#ef4444")
            }
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use with hooks context
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  section?: string;
}

export const SectionErrorBoundary: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  section = "section",
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "rgba(239, 68, 68, 0.05)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
          }}
        >
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>
            Unable to load {section}. Please refresh the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
