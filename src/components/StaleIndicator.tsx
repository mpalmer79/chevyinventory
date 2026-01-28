// src/components/StaleIndicator.tsx
import React, { FC } from "react";

interface Props {
  isStale: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const StaleIndicator: FC<Props> = ({
  isStale,
  lastUpdated,
  onRefresh,
  isRefreshing,
}) => {
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  return (
    <div className="stale-indicator">
      <span className={`stale-dot ${isStale ? "stale" : ""}`} />
      <span>
        {isRefreshing
          ? "Refreshing..."
          : lastUpdated
          ? `Updated ${formatTime(lastUpdated)}`
          : "Loading..."}
      </span>
      {isStale && !isRefreshing && (
        <button className="stale-refresh" onClick={onRefresh}>
          Refresh
        </button>
      )}
    </div>
  );
};
