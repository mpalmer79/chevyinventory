// src/components/LoadingIndicator.tsx
import React, { FC, memo } from "react";

interface LoadingIndicatorProps {
  message?: string;
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export const LoadingIndicator: FC<LoadingIndicatorProps> = memo(({
  message = "Loading...",
  size = "medium",
  fullScreen = false,
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64,
  };

  const spinnerSize = sizeMap[size];

  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(2, 6, 23, 0.9)",
        zIndex: 9999,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      };

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid rgba(148, 163, 184, 0.2)`,
    borderTopColor: "#22c55e",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyle} />
      {message && (
        <p
          style={{
            marginTop: 16,
            color: "#9ca3af",
            fontSize: size === "small" ? 12 : 14,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
});

LoadingIndicator.displayName = "LoadingIndicator";

export default LoadingIndicator;
