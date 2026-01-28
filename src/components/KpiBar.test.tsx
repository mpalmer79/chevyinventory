// src/components/KpiBar.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiBar } from "./KpiBar";

describe("KpiBar", () => {
  const defaultProps = {
    totalUnits: 150,
    newArrivalCount: 25,
    inTransitCount: 12,
    onSelectTotalUnits: vi.fn(),
    onSelectNewArrivals: vi.fn(),
    onSelectInTransit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all three KPI cards", () => {
    render(<KpiBar {...defaultProps} />);

    expect(screen.getByText("Total Units")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals (≤ 7 days)")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
  });

  it("displays correct values", () => {
    render(<KpiBar {...defaultProps} />);

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("calls onSelectTotalUnits when Total Units card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const totalUnitsCard = screen.getByText("Total Units").closest(".kpi-card");
    fireEvent.click(totalUnitsCard!);

    expect(defaultProps.onSelectTotalUnits).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectNewArrivals when New Arrivals card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const newArrivalsCard = screen
      .getByText("New Arrivals (≤ 7 days)")
      .closest(".kpi-card");
    fireEvent.click(newArrivalsCard!);

    expect(defaultProps.onSelectNewArrivals).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectInTransit when In Transit card is clicked", () => {
    render(<KpiBar {...defaultProps} />);

    const inTransitCard = screen.getByText("In Transit").closest(".kpi-card");
    fireEvent.click(inTransitCard!);

    expect(defaultProps.onSelectInTransit).toHaveBeenCalledTimes(1);
  });

  it("renders with zero values", () => {
    render(
      <KpiBar
        {...defaultProps}
        totalUnits={0}
        newArrivalCount={0}
        inTransitCount={0}
      />
    );

    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(3);
  });

  it("handles large numbers", () => {
    render(
      <KpiBar
        {...defaultProps}
        totalUnits={9999}
        newArrivalCount={500}
        inTransitCount={100}
      />
    );

    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("applies clickable class to values", () => {
    render(<KpiBar {...defaultProps} />);

    const clickableValues = document.querySelectorAll(".kpi-value.clickable");
    expect(clickableValues).toHaveLength(3);
  });

  it("applies special color to In Transit value", () => {
    render(<KpiBar {...defaultProps} />);

    const inTransitCard = screen.getByText("In Transit").closest(".kpi-card");
    const inTransitValue = inTransitCard?.querySelector(".kpi-value");

    expect(inTransitValue).toHaveStyle({ color: "#fbbf24" });
  });
});
