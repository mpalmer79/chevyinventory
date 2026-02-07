# ABC Motors Inventory Dashboard - Changelog

**Documentation Date:** February 2026
**Repository:** ABC-Motors-Inventory-report

---

## Version 1.0.0

Initial release of ABC Motors Inventory Intelligence Dashboard - a rebranded and genericized version of the inventory management system designed for multi-rooftop automotive dealerships.

---

## Features

### Multi-Dealership Support
- Dealership selector with support for multiple rooftops
- Per-dealership inventory loading from separate Excel files
- Independent caching per dealership
- Seamless context switching

### Inventory Intelligence
- Dynamic aging buckets with drill-down support
- Aging classification: Fresh (0-30), Normal (31-60), Watch (61-90), At Risk (90+)
- New arrivals highlighting
- Oldest units surfacing for intervention

### Advanced Filtering
- Dealership selector
- Year filter
- Make filter with cascading Model dropdown
- Stock number search

### Model Normalization
- Auto-split high-volume models by model number
- Improved clarity and grouping accuracy

### KPI Dashboard
- Total inventory count
- New arrivals tracking
- In-transit units
- Average inventory age
- Aging distribution visualization
- Model distribution charts

### Performance Optimizations
- Virtualized table rendering (@tanstack/react-virtual)
- Client-side caching with stale-while-revalidate pattern
- Gzip/Brotli compression
- Terser minification
- Vendor chunk splitting

### UX Features
- Drawer-based vehicle detail inspection
- Loading and stale indicators
- Light/Dark theme toggle
- Error boundaries with graceful fallbacks
- Responsive mobile layout
- CSV export functionality

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React 18.3.1                            │
├──────────────────────┬──────────────────────────────────────────┤
│     Zustand Store    │           Components                     │
│  ┌────────────────┐  │  ┌────────────┐ ┌──────────────────────┐ │
│  │ inventoryStore │──┼──│ App.tsx    │ │ FiltersBar.tsx       │ │
│  │ - rows[]       │  │  │            │ │ - Dealership dropdown│ │
│  │ - filters      │  │  └────────────┘ │ - Make filter        │ │
│  │ - selectedMake │  │                 │ - Model cascade      │ │
│  │ - drillType    │  │                 └──────────────────────┘ │
│  └────────────────┘  │  ┌─────────────────────────────────────┐ │
│                      │  │ useInventoryLoader.ts               │ │
│                      │  │ - Per-dealership file loading       │ │
│                      │  │ - Stale-while-revalidate caching    │ │
│                      │  └─────────────────────────────────────┘ │
├──────────────────────┴──────────────────────────────────────────┤
│  TypeScript 5.7.3  │  Vite 6.0.7  │  Tailwind CSS 3.4.17       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Files

| Dealership | File Path | Purpose |
|------------|-----------|---------|
| Primary | `/public/inventory.xlsx` | Main dealership inventory |
| Secondary | `/public/gmc-inventory.xlsx` | Secondary rooftop inventory |

---

## Quality Metrics

| Metric | Value |
|--------|-------|
| TypeScript Coverage | 100% (strict mode) |
| Test Files | 4 (`*.test.ts` / `*.test.tsx`) |
| ESLint Rules | 0 warnings allowed |
| Bundle Size | Optimized with vendor splitting |
| Responsive | Mobile-first with lazy loading |

---

## Customization

This dashboard is designed as a white-label solution. Key customization points:

1. **Branding Colors**: `tailwind.config.js` and `src/index.css`
2. **Dealership URLs**: `src/utils/vehicleUrl.ts`
3. **Inventory Files**: `/public/*.xlsx`
4. **Logo**: `/public/abc-motors-logo.png`

---

*ABC Motors Inventory Intelligence Dashboard*
