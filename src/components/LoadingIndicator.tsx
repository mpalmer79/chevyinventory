// src/components/LoadingIndicator.tsx
import React, { FC } from "react";

interface Props {
  message?: string;
  size?: "small" | "medium" | "large";
}

export const LoadingIndicator: FC<Props> = ({
  message = "Loading...",
  size = "medium",
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 56,
  };

  return (
    <div className="loading-container">
      <div
        className="loading-spinner"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      />
      {message && <div className="loading-text">{message}</div>}
    </div>
  );
};
