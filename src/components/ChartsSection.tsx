// src/components/ChartsSection.tsx
import React, { FC, memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AgingBuckets, ModelPieDatum } from "../types";

interface Props {
  modelPieData: ModelPieDatum[];
  agingBuckets: AgingBuckets;
  agingHandlers: {
    on0_30: () => void;
    on31_60: () => void;
    on61_90: () => void;
    on90_plus: () => void;
  };
}

const MODEL_COLORS = [
  "#0066B1", // Chevy Blue
  "#16a34a", // Quirk Green
  "#f97316", // Orange
  "#eab308", // Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#64748b", // Slate
];

export const ChartsSection: FC<Props> = memo(({
  modelPieData,
  agingBuckets,
  agingHandlers,
}) => {
  return (
    <div className="charts-grid">
      {/* Model Mix Pie Chart */}
      <div className="chart-card">
        <div className="chart-title">Inventory Mix · Top Models</div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={modelPieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {modelPieData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={MODEL_COLORS[index % MODEL_COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, "Units"]}
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
          {modelPieData.slice(0, 6).map((item, index) => (
            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
              <span style={{ 
                width: "10px", 
                height: "10px", 
                borderRadius: "2px", 
                background: MODEL_COLORS[index % MODEL_COLORS.length] 
              }} />
              <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Aging Buckets */}
      <div className="chart-card">
        <div className="chart-title">Aging Overview · Days in Stock</div>
        <div className="aging-grid">
          <div 
            className="aging-bucket fresh" 
            onClick={agingHandlers.on0_30}
            role="button"
            tabIndex={0}
          >
            <div className="aging-bucket-label">0–30 Days</div>
            <div className="aging-bucket-value">{agingBuckets.bucket0_30}</div>
            <span className="badge badge-fresh">Fresh</span>
          </div>

          <div 
            className="aging-bucket normal" 
            onClick={agingHandlers.on31_60}
            role="button"
            tabIndex={0}
          >
            <div className="aging-bucket-label">31–60 Days</div>
            <div className="aging-bucket-value">{agingBuckets.bucket31_60}</div>
            <span className="badge badge-normal">Normal</span>
          </div>

          <div 
            className="aging-bucket watch" 
            onClick={agingHandlers.on61_90}
            role="button"
            tabIndex={0}
          >
            <div className="aging-bucket-label">61–90 Days</div>
            <div className="aging-bucket-value">{agingBuckets.bucket61_90}</div>
            <span className="badge badge-watch">Watch</span>
          </div>

          <div 
            className="aging-bucket risk" 
            onClick={agingHandlers.on90_plus}
            role="button"
            tabIndex={0}
          >
            <div className="aging-bucket-label">90+ Days</div>
            <div className="aging-bucket-value">{agingBuckets.bucket90_plus}</div>
            <span className="badge badge-risk">At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartsSection.displayName = "ChartsSection";
