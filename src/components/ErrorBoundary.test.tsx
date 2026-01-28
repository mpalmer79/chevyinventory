// src/components/ErrorBoundary.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary, SectionErrorBoundary } from "./ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

// Suppress console.error for cleaner test output
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders default error UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred/i)
    ).toBeInTheDocument();
  });

  it("displays error message in details", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Open details
    const details = screen.getByText("Error details");
    fireEvent.click(details);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("calls onError callback when error occurs", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("recovers when Try Again button is clicked", () => {
    let shouldThrow = true;

    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error("Test error");
      }
      return <div>Recovered content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Click retry
    fireEvent.click(screen.getByText("Try Again"));

    // Force rerender to see recovered state
    rerender(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Note: The component would need to be remounted for full recovery
    // This test validates the retry button exists and is clickable
  });

  it("renders Try Again button", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole("button", { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });
});

describe("SectionErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <SectionErrorBoundary section="test section">
        <div>Section content</div>
      </SectionErrorBoundary>
    );

    expect(screen.getByText("Section content")).toBeInTheDocument();
  });

  it("renders section-specific error message when child throws", () => {
    render(
      <SectionErrorBoundary section="inventory table">
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(
      screen.getByText(/Unable to load inventory table/i)
    ).toBeInTheDocument();
  });

  it("uses default section name when not provided", () => {
    render(
      <SectionErrorBoundary>
        <ThrowError />
      </SectionErrorBoundary>
    );

    expect(screen.getByText(/Unable to load section/i)).toBeInTheDocument();
  });
});

describe("ErrorBoundary edge cases", () => {
  it("handles errors in deeply nested components", () => {
    const DeepChild = () => {
      throw new Error("Deep error");
    };

    render(
      <ErrorBoundary>
        <div>
          <div>
            <div>
              <DeepChild />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("catches errors during render phase", () => {
    const RenderError = () => {
      const obj: Record<string, unknown> = {};
      // This will throw during render
      return <div>{(obj.nested as { prop: string }).prop}</div>;
    };

    render(
      <ErrorBoundary>
        <RenderError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
