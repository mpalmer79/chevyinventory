// src/components/ChartsSection.tsx
import React, { FC } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ModelPieDatum, AgingBuckets } from "../types";
import { getModelColor } from "../inventoryHelpers";

type ChartsSectionProps = {
  modelPieData: ModelPieDatum[];
  agingBuckets: AgingBuckets;
  agingHandlers: {
    on0_30: () => void;
    on31_60: () => void;
    on61_90: () => void;
    on90_plus: () => void;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: any[];
  label?: string;
  total: number;
};

// Custom tooltip: shows slice name, value and percent inside a dark rounded box
const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label, total }) => {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const name = item?.name ?? label ?? "";
  const value = Number(item?.value ?? 0);
  const percent = total ? ((value / total) * 100).toFixed(1) : "0.0";

  return (
    <div
      style={{
        background: "#020617",
        border: "1px solid rgba(148,163,184,0.5)",
        borderRadius: 8,
        color: "#e6f7ef",
        padding: "8px 10px",
        minWidth: 120,
        boxShadow: "0 6px 18px rgba(2,6,23,0.6)",
        fontSize: 13,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.85 }}>{name}</div>
      <div style={{ marginTop: 6, fontWeight: 700, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div>{value}</div>
        <div style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{percent}%</div>
      </div>
    </div>
  );
};

export const ChartsSection: FC<ChartsSectionProps> = ({
  modelPieData,
  agingBuckets,
  agingHandlers,
}) => {
  const total = modelPieData.reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <section className="panel-grid">
      <div className="panel">
        <div className="section-title centered">Inventory Mix · Top Models</div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modelPieData}
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {modelPieData.map((entry, index) => (
                  <Cell key={index} fill={getModelColor(entry.name, index)} />
                ))}
              </Pie>

              {/* Custom tooltip content so the dark rounded box contains name, value and percent */}
              <Tooltip
                content={(props: any) => <CustomTooltip {...props} total={total} />}
                itemStyle={{ display: "none" }}
                cursor={false}
                wrapperStyle={{ outline: "none", background: "transparent" }}
              />

              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: 11,
                  paddingTop: 16,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="section-title centered">
          Aging Overview · Days in Stock
        </div>

        <div className="aging-grid">
          <div className="aging-card" onClick={agingHandlers.on0_30}>
            <div className="aging-label">0–30 Days</div>
            <div className="aging-count clickable">
              {agingBuckets.bucket0_30}
            </div>
            <span className="aging-tag fresh">Fresh</span>
          </div>

          <div className="aging-card" onClick={agingHandlers.on31_60}>
            <div className="aging-label">31–60 Days</div>
            <div className="aging-count clickable">
              {agingBuckets.bucket31_60}
            </div>
            <span className="aging-tag normal">Normal</span>
          </div>

          <div className="aging-card" onClick={agingHandlers.on61_90}>
            <div className="aging-label">61–90 Days</div>
            <div className="aging-count clickable">
              {agingBuckets.bucket61_90}
            </div>
            <span className="aging-tag watch">Watch</span>
          </div>

          <div className="aging-card aging-risk" onClick={agingHandlers.on90_plus}>
            <div className="aging-label">90+ Days</div>
            <div className="aging-count clickable">
              {agingBuckets.bucket90_plus}
            </div>
            <span className="aging-tag risk">At Risk</span>
          </div>
        </div>

        <p className="aging-footnote">
          {/* existing content */}
        </p>
      </div>
    </section>
  );
};

export default ChartsSection;
