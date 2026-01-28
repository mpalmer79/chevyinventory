// src/components/StaleIndicator.tsx
import React, { FC, memo } from "react";

interface StaleIndicatorProps {
  isStale: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const StaleIndicator: FC<StaleIndicatorProps> = memo(({
  isStale,
  lastUpdated,
  onRefresh,
  isRefreshing = false,
}) => {
  if (!isStale && !lastUpdated) return null;

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        background: isStale ? "rgba(251, 191, 36, 0.1)" : "rgba(34, 197, 94, 0.1)",
        borderRadius: 8,
        fontSize: 12,
        color: isStale ? "#fbbf24" : "#22c55e",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: isStale ? "#fbbf24" : "#22c55e",
          animation: isRefreshing ? "pulse 1s infinite" : undefined,
        }}
      />
      
      <span style={{ color: "#9ca3af" }}>
        {isRefreshing ? (
          "Refreshing..."
        ) : lastUpdated ? (
          <>Updated {formatTime(lastUpdated)}</>
        ) : (
          "Loading..."
        )}
      </span>

      {isStale && !isRefreshing && (
        <button
          onClick={onRefresh}
          style={{
            marginLeft: "auto",
            padding: "4px 12px",
            background: "rgba(251, 191, 36, 0.2)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            borderRadius: 4,
            color: "#fbbf24",
            fontSize: 11,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "rgba(251, 191, 36, 0.3)")}
          onMouseOut={(e) => (e.currentTarget.style.background = "rgba(251, 191, 36, 0.2)")}
        >
          Refresh
        </button>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
});

StaleIndicator.displayName = "StaleIndicator";

export default StaleIndicator;
