# CLAUDE.md - Quirk Inventory Dashboard

## Project Overview

**Quirk Inventory Intelligence Dashboard** - A production-grade React/TypeScript inventory analytics platform for Quirk Auto Dealers (17+ locations across MA/NH). Converts raw Excel inventory data into actionable insights for merchandising, aging risk management, and operational decision-making.

**Live Site:** https://chevynhinventory.netlify.app/

---

## Tech Stack

- **Framework:** React 18.3 + TypeScript 5.7
- **Build:** Vite 6.0
- **Styling:** Tailwind CSS + shadcn/ui components
- **State:** Zustand 5.0
- **Charts:** Recharts
- **Data:** XLSX parsing from static Excel files
- **Testing:** Vitest + React Testing Library
- **Deployment:** Netlify

---

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm run build        # TypeScript check + production build
npm run test         # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # TypeScript only check
npm run format       # Prettier format
```

---

## Project Structure

```
src/
├── App.tsx                 # Main app component with filtering/drill logic
├── types.ts                # TypeScript types (InventoryRow, Filters, DrillType)
├── store/
│   └── inventoryStore.ts   # Zustand state management
├── hooks/
│   ├── useInventoryLoader.ts  # Main data loading hook (KEEP)
│   ├── useInventoryCache.ts   # UNUSED - delete
│   ├── useInventoryData.ts    # UNUSED - delete
│   └── useMediaQuery.ts       # Responsive breakpoint hook
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── ChartsSection.tsx   # Pie chart + aging buckets
│   ├── DrilldownTable.tsx  # Grouped drill-down view
│   ├── VirtualizedTable.tsx # Performance-optimized table
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   └── ...
├── utils/
│   ├── vehicleUrl.ts       # URL generation (CRITICAL - needs tests)
│   ├── modelFormatting.ts  # Model number → display name mapping
│   └── inventoryUtils.ts   # Sorting, transit detection
├── styles/                 # CSS modules
└── test/                   # Test setup
```

---

## Current Grade: 8.8/10 (A-)

### Target: 9.2+ (A)

---

## TASK LIST - Improvements Needed

Complete these tasks in order. Each task should be a separate commit.

---

### TASK 1: Remove Unused Hooks

**Priority:** High | **Complexity:** Low

Delete these unused files:
- `src/hooks/useInventoryCache.ts`
- `src/hooks/useInventoryData.ts`

**Verification:** Run `npm run build` - should pass with no errors.

---

### TASK 2: Create Constants File for Drill Types

**Priority:** High | **Complexity:** Low

Create `src/constants/drillTypes.ts`:

```typescript
// src/constants/drillTypes.ts

export const DRILL_TYPES = {
  TOTAL: "total",
  NEW: "new",
  IN_TRANSIT: "in_transit",
  IN_STOCK: "in_stock",
  AGE_0_30: "0_30",
  AGE_31_60: "31_60",
  AGE_61_90: "61_90",
  AGE_90_PLUS: "90_plus",
} as const;

export const DRILL_TITLES: Record<string, string> = {
  [DRILL_TYPES.AGE_0_30]: "Fresh Inventory (0-30 Days)",
  [DRILL_TYPES.AGE_31_60]: "Normal Aging (31-60 Days)",
  [DRILL_TYPES.AGE_61_90]: "Watch List (61-90 Days)",
  [DRILL_TYPES.AGE_90_PLUS]: "At Risk (90+ Days)",
  [DRILL_TYPES.NEW]: "New Arrivals (7 Days)",
  [DRILL_TYPES.IN_TRANSIT]: "In Transit Inventory",
  [DRILL_TYPES.IN_STOCK]: "In Stock Inventory",
};

export const MODEL_DRILL_PREFIX = "model:";

export const isModelDrill = (type: string | null): boolean => 
  type?.startsWith(MODEL_DRILL_PREFIX) ?? false;

export const getModelFromDrill = (type: string): string =>
  type.replace(MODEL_DRILL_PREFIX, "");
```

Then refactor `App.tsx` to import and use these constants instead of magic strings.

**Verification:** `npm run typecheck` and `npm run test` should pass.

---

### TASK 3: Add Vehicle URL Tests

**Priority:** Critical | **Complexity:** Medium

Create `src/utils/vehicleUrl.test.ts` with comprehensive tests covering:

1. **Domain Routing Tests**
   - Chevrolet routes to quirkchevynh.com
   - GMC routes to quirkbuickgmc.com  
   - Buick routes to quirkbuickgmc.com

2. **Truck URL Tests**
   - Silverado with crew cab generates correct URL
   - Sierra uses "four-wheel-drive" instead of "4wd"
   - Handle double cab, regular cab variants

3. **Corvette URL Tests**
   - Stingray coupe URL format
   - E-Ray convertible with AWD
   - Z06 variants

4. **SUV URL Tests**
   - Tahoe, Suburban generate SUV body type
   - Equinox, Traverse, Blazer variants

5. **Edge Cases**
   - Empty VIN returns empty string
   - Missing Body field handled gracefully
   - Missing Trim field handled

Use this mock factory:

```typescript
const createMockRow = (overrides: Partial<InventoryRow>): InventoryRow => ({
  "Stock Number": "TEST001",
  Year: 2024,
  Make: "CHEVROLET",
  Model: "SILVERADO 1500",
  "Exterior Color": "WHITE",
  Trim: "LT",
  "Model Number": "CK10543",
  Cylinders: 8,
  Age: 10,
  MSRP: 50000,
  Status: "ON DEALER LOT",
  VIN: "1gcuyded1rz123456",
  Body: '4WD Crew Cab 147" w/1',
  ...overrides,
});
```

**Verification:** `npm run test` should show new vehicleUrl tests passing.

---

### TASK 4: Convert ErrorBoundary to Tailwind

**Priority:** Medium | **Complexity:** Medium

Refactor `src/components/ErrorBoundary.tsx` to use Tailwind classes instead of inline styles.

Key mappings:
- `padding: "40px 20px"` -> `px-5 py-10`
- `textAlign: "center"` -> `text-center`
- `background: "rgba(239, 68, 68, 0.1)"` -> `bg-red-500/10`
- `border: "1px solid rgba(239, 68, 68, 0.3)"` -> `border border-red-500/30`
- `borderRadius: "12px"` -> `rounded-xl`
- `fontSize: "48px"` -> `text-5xl`
- `fontSize: "20px"` -> `text-xl`
- `fontSize: "14px"` -> `text-sm`
- `fontSize: "12px"` -> `text-xs`
- `fontSize: "11px"` -> `text-xs`
- `fontWeight: 600` -> `font-semibold`
- `color: "#ef4444"` -> `text-red-500`
- `color: "#9ca3af"` -> `text-muted-foreground`
- `color: "#ffffff"` -> `text-white`
- `marginBottom: "8px"` -> `mb-2`
- `marginBottom: "16px"` -> `mb-4`
- `marginBottom: "20px"` -> `mb-5`
- `marginTop: "8px"` -> `mt-2`
- `maxWidth: "400px"` -> `max-w-md`
- `maxWidth: "500px"` -> `max-w-lg`
- `margin: "0 auto 20px"` -> `mx-auto mb-5`
- `cursor: "pointer"` -> `cursor-pointer`
- `whiteSpace: "pre-wrap"` -> `whitespace-pre-wrap`
- `wordBreak: "break-word"` -> `break-words`

Remove all `onMouseOver` and `onMouseOut` handlers - use Tailwind `hover:` variants instead.

**Verification:** Visual check that error UI still looks correct, `npm run build` passes.

---

### TASK 5: Add .gitattributes for Line Endings

**Priority:** Low | **Complexity:** Low

Create `.gitattributes` in project root:

```
# .gitattributes - Normalize line endings
* text=auto eol=lf
*.{cmd,[cC][mM][dD]} text eol=crlf
*.{bat,[bB][aA][tT]} text eol=crlf
```

Then normalize existing files:

```bash
git add --renormalize .
git commit -m "chore: normalize line endings"
```

**Verification:** `file tailwind.config.js` should show "ASCII text" not "with CRLF".

---

### TASK 6: Create Data Service Abstraction

**Priority:** Medium | **Complexity:** Medium

Create `src/services/inventoryService.ts` to abstract data fetching:

```typescript
// src/services/inventoryService.ts
import * as XLSX from "xlsx";
import { InventoryRow, DealerSource } from "../types";

export const INVENTORY_PATHS: Record<DealerSource, string> = {
  chevrolet: "/inventory.xlsx",
  "buick-gmc": "/gmc-inventory.xlsx",
};

export interface InventoryService {
  fetchInventory(source: DealerSource): Promise<InventoryRow[]>;
}

export const excelInventoryService: InventoryService = {
  async fetchInventory(source: DealerSource): Promise<InventoryRow[]> {
    const path = INVENTORY_PATHS[source];
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch inventory`);
    }
    
    const data = await response.arrayBuffer();
    return parseExcelData(data);
  },
};

function parseExcelData(data: ArrayBuffer): InventoryRow[] {
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  
  if (!sheetName) throw new Error("No sheets found in workbook");
  
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error("Worksheet not found");

  const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  return rawData
    .filter((row) => row["Stock Number"] != null && String(row["Stock Number"]).trim() !== "")
    .map((row) => ({
      "Stock Number": String(row["Stock Number"] ?? ""),
      Year: Number(row["Year"]) || 0,
      Make: String(row["Make"] ?? ""),
      Model: String(row["Model"] ?? ""),
      "Exterior Color": String(row["Exterior Color"] ?? ""),
      Trim: String(row["Trim"] ?? ""),
      "Model Number": String(row["Model Number"] ?? ""),
      Cylinders: Number(row["Cylinders"]) || 0,
      Age: Number(row["Age"]) || 0,
      MSRP: Number(row["MSRP"]) || 0,
      Status: String(row["Category"] ?? ""),
      VIN: String(row["VIN"] ?? ""),
      Body: String(row["Body"] ?? ""),
      "Body Type": String(row["Body Type"] ?? ""),
      Category: String(row["Category"] ?? ""),
    }));
}

export default excelInventoryService;
```

Then update `useInventoryLoader.ts` to import and use `inventoryService.fetchInventory()`.

Move `INVENTORY_PATHS` from `inventoryHelpers.ts` to the service file.

**Verification:** App still loads inventory correctly, `npm run build` passes.

---

### TASK 7: Add Accessibility Improvements

**Priority:** Medium | **Complexity:** Low

Add missing ARIA attributes:

**ChartsSection.tsx:**
```tsx
<button
  type="button"
  aria-label={`View ${value} vehicles aged ${label}`}
  onClick={onClick}
  ...
>
```

**VirtualizedTable.tsx:**
```tsx
<div role="table" aria-label="Vehicle inventory">
  <div role="rowgroup" className="sticky top-0...">
    <div role="row">
      <div role="columnheader">Stock #</div>
      ...
    </div>
  </div>
```

**KpiBar.tsx:**
```tsx
<button
  aria-label={`View all ${totalVehicles} vehicles in inventory`}
  onClick={onTotalClick}
  ...
>
```

**FiltersBar.tsx:**
Add `aria-label` to Select components and search input.

**Verification:** Run Lighthouse accessibility audit - target 90+ score.

---

### TASK 8: Add VirtualizedTable Tests

**Priority:** Medium | **Complexity:** Medium

Create `src/components/VirtualizedTable.test.tsx`:

Test cases to cover:
1. Renders vehicle rows correctly
2. Displays correct vehicle count
3. Calls onRowClick when row is clicked
4. Groups vehicles by year and model
5. Returns null when rows array is empty
6. Sorts groups by year descending
7. Stock number link opens in new tab

Use the same mock factory pattern from vehicleUrl tests.

**Verification:** `npm run test` shows VirtualizedTable tests passing.

---

## Code Style Notes

- Use `memo()` for components receiving large arrays
- Use `useMemo()` for expensive calculations  
- Use `useCallback()` for handlers passed to children
- Prefer Tailwind classes over inline styles
- All components should have `displayName` set for DevTools
- Tests should cover happy path + edge cases

---

## Critical Files - Handle with Care

| File | Reason |
|------|--------|
| `src/utils/vehicleUrl.ts` | Complex URL generation logic for dealership websites |
| `src/utils/modelFormatting.ts` | Model number to body style mapping (trucks) |
| `src/store/inventoryStore.ts` | Central state - changes affect entire app |
| `src/hooks/useInventoryLoader.ts` | Data loading + caching logic |

---

## After Completing All Tasks

Run full verification:

```bash
npm run typecheck
npm run lint  
npm run test
npm run build
```

All should pass with zero warnings/errors.

**Expected Final Grade: 9.2/10 (A)**
