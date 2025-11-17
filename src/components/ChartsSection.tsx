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

export const ChartsSection: FC<ChartsSectionProps> = ({
  modelPieData,
  agingBuckets,
  agingHandlers,
}) => (
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
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid rgba(148,163,184,0.5)",
                borderRadius: 8,
              }}
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
        Focus on <span className="text-highlight">90+ day</span> units first.
      </p>
    </div>
  </section>
);

