// src/components/KpiBar.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiBar } from "./KpiBar";

describe("KpiBar", () => {
  const defaultProps = {
    totalVehicles: 150,
    totalNew: 25,
    inTransit: 12,
    avgAge: 42,
    onTotalClick: vi.fn(),
    onNewClick: vi.fn(),
    onTransitClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all four KPI cards", () => {
    render(<KpiBar {...defaultProps} />);

    expect(screen.getByText("Total Vehicles")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
    expect(screen.getByText("Avg. Age")).toBeInTheDocument();
  });

  it("displays correct values", () => {
    render(<KpiBar {...defaultProps} />);

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("42 days")).toBeInTheDocument();
  });

  it("calls onTotalClick when Total Vehicles card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const totalCard = screen.getByText("Total Vehicles").closest("[class*='cursor-pointer']");
    fireEvent.click(totalCard!);

    expect(defaultProps.onTotalClick).toHaveBeenCalledTimes(1);
  });

  it("calls onNewClick when New Arrivals card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const newArrivalsCard = screen.getByText("New Arrivals").closest("[class*='cursor-pointer']");
    fireEvent.click(newArrivalsCard!);

    expect(defaultProps.onNewClick).toHaveBeenCalledTimes(1);
  });

  it("calls onTransitClick when In Transit card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const inTransitCard = screen.getByText("In Transit").closest("[class*='cursor-pointer']");
    fireEvent.click(inTransitCard!);

    expect(defaultProps.onTransitClick).toHaveBeenCalledTimes(1);
  });

  it("renders with zero values", () => {
    render(
      <KpiBar
        {...defaultProps}
        totalVehicles={0}
        totalNew={0}
        inTransit={0}
        avgAge={0}
      />
    );

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
    expect(screen.getByText("0 days")).toBeInTheDocument();
  });

  it("handles large numbers", () => {
    render(
      <KpiBar
        {...defaultProps}
        totalVehicles={9999}
        totalNew={500}
        inTransit={100}
        avgAge={365}
      />
    );

    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("365 days")).toBeInTheDocument();
  });

  it("renders icons for each KPI card", () => {
    render(<KpiBar {...defaultProps} />);

    // Lucide icons render as SVG elements
    const svgIcons = document.querySelectorAll("svg");
    expect(svgIcons.length).toBeGreaterThanOrEqual(4);
  });
});
