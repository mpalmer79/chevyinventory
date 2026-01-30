# Quirk NH Inventory Dashboard - Changelog v3.0.0

**Documentation Date:** January 30, 2026  
**Repository:** [chevyinventory](https://github.com/mpalmer79/chevyinventory)  
**Live Site:** [chevynhinventory.netlify.app](https://chevynhinventory.netlify.app/)

---

## Version Analysis

| Location | Version | Status |
|----------|---------|--------|
| `package.json` | 3.0.0 | ✅ Current |
| `README.md` badge | 3.0.0 | ✅ Synchronized |

**Conclusion:** Version 3.0.0 in both files is current and reflects all recent updates. No version bump required.

---

## Recent Development Timeline

### January 27-28, 2026 — Foundation Upgrades (Phase 1-3)

| Component | Enhancement |
|-----------|-------------|
| **State Management** | Migrated to Zustand 5.0.3 with centralized `inventoryStore.ts` |
| **Performance** | Integrated `@tanstack/react-virtual` for virtualized table rendering |
| **Caching** | Implemented stale-while-revalidate pattern with 5-minute threshold |
| **Testing** | Added Vitest 2.1.8 with Testing Library, 4 test files created |
| **Code Quality** | Configured ESLint 8.57 + Prettier 3.4.2, `.eslintrc.cjs` and `.prettierrc` added |
| **Build** | Bundle compression (gzip/Brotli), Terser minification, vendor chunking |
| **UX Indicators** | `LoadingIndicator.tsx` and `StaleIndicator.tsx` components |
| **Images** | `OptimizedImage.tsx` with lazy loading and blur placeholders |
| **Error Handling** | `ErrorBoundary.tsx` with graceful fallback UI |

### January 28, 2026 — Visual Design Overhaul

| Change | Before | After |
|--------|--------|-------|
| Hero image height | 850px | 380px |
| Dashboard visibility | Below fold | Above fold |
| Oldest Units position | In filters area | Between New Arrivals and Inventory Table |
| Card text alignment | Left-aligned | Center-aligned (KPIs, health stats, charts) |
| Header design | Basic | Professional showroom image with QUIRK logo |

### January 29, 2026 — Multi-Dealership Integration

#### New Features Implemented

**1. Dealership Selector**
- Added `DealerSource` type: `"chevrolet" | "buick-gmc"`
- Dropdown selector as first filter in FiltersBar
- Per-dealership inventory loading from separate Excel files
- Independent caching per dealership

**2. Make Filter**
- New dropdown: Buick, Chevrolet, GMC options
- Dynamically populated from current inventory data
- Cascades to Model dropdown (filters available models)

**3. Sierra 1500 Model Number Splitting**
- Added to `SPLIT_BY_MODEL_NUMBER` array
- Variants displayed: TK10543, TK10743, TK10753
- Consistent with existing Silverado 1500/2500HD splitting

**4. Filter Bar Reorganization**
```
Layout Order: Dealership → Year → Make → Model → Stock Number → Search → Theme
```
- Removed redundant "View All" button
- Removed "Search Inventory" text field
- Streamlined user workflow

**5. Theme Toggle Enhancement**
| Before | After |
|--------|-------|
| Simple sun/moon icon | Segmented control |
| Click to toggle | Explicit "Light" / "Dark" buttons |
| No labels | Labeled with icons |

**6. Pie Chart Tooltip**
- Changed from generic "Units" label to actual model name
- Improved data comprehension on hover

---

## Files Modified (January 29, 2026)

| File | Key Changes |
|------|-------------|
| `src/types.ts` | Added `DealerSource` type, `make` field to `Filters` |
| `src/inventoryHelpers.ts` | Added `INVENTORY_PATHS`, `DEALER_LABELS` maps |
| `src/store/inventoryStore.ts` | Added `selectedMake` state and setter |
| `src/hooks/useInventoryLoader.ts` | Make-based file loading with per-dealership caching |
| `src/components/FiltersBar.tsx` | Dealership dropdown, Make filter, cascading Model, layout reorganization |
| `src/components/App.tsx` | Wired `selectedMake` and `onMakeChange` props, Sierra 1500 splitting |
| `src/components/InventoryTable.tsx` | Sierra 1500 subgrouping support |
| `src/components/VirtualizedTable.tsx` | Sierra 1500 subgrouping display |
| `src/components/ChartsSection.tsx` | Pie chart tooltip shows model name |
| `src/components/ui/ThemeToggle.tsx` | Segmented control with Light/Dark labels |
| `src/styles/theme.css` | Theme toggle segmented control styles |

---

## Architecture Overview (v3.0.0)

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
| Chevrolet | `/public/inventory.xlsx` | Quirk Chevy NH inventory |
| Buick GMC | `/public/gmc-inventory.xlsx` | Quirk Buick GMC NH inventory |

---

## UPGRADE_ROADMAP_v2.md Status Update

The roadmap shows Phase 4 item "Multi-dealership support" as incomplete, but this was **completed on January 29, 2026**. Recommended update:

```markdown
### Phase 4 (Month 3): Polish
- [ ] Design system migration (shadcn/ui)
- [ ] PWA features (offline, install prompt)
- [ ] Advanced analytics
- [x] Multi-dealership support ✅ COMPLETE (2026-01-29)
- [ ] E2E tests (Playwright)
```

---

## Quality Metrics

| Metric | Value |
|--------|-------|
| TypeScript Coverage | 100% (strict mode) |
| Test Files | 6 (`*.test.ts` / `*.test.tsx`) |
| ESLint Rules | 0 warnings allowed |
| Bundle Size | Optimized with vendor splitting |
| Lighthouse | Mobile-responsive, lazy loading |

---

## Commit Summary (January 29, 2026)

Based on observed timestamps from repository screenshots:

| File/Folder | Last Commit | Timestamp |
|-------------|-------------|-----------|
| `src/components/ChartsSection.tsx` | Update ChartsSection.tsx | yesterday |
| `src/components/FiltersBar.tsx` | Update FiltersBar.tsx | yesterday |
| `src/components/InventoryTable.tsx` | Update InventoryTable.tsx | yesterday |
| `src/components/VirtualizedTable.tsx` | Update VirtualizedTable.tsx | yesterday |
| `src/components/ui/ThemeToggle.tsx` | Update ThemeToggle.tsx | yesterday |
| `src/hooks/useInventoryLoader.ts` | Update useInventoryLoader.ts | yesterday |
| `src/store/inventoryStore.ts` | Update inventoryStore.ts | yesterday |
| `src/styles/theme.css` | Update theme.css | yesterday |
| `src/types.ts` | Update types.ts | yesterday |
| `src/inventoryHelpers.ts` | Update inventoryHelpers.ts | yesterday |
| `src/App.tsx` | Update App.tsx | yesterday |

---

## Next Steps (Recommended)

1. **Update UPGRADE_ROADMAP_v2.md** - Mark multi-dealership support as complete
2. **Add Progress Log entry** for January 29, 2026 work
3. **Consider v3.1.0** if additional Phase 4 items are completed

---

*Documentation generated: January 30, 2026*  
*Quirk Auto Dealers — New England's Largest Automotive Group*
