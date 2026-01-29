# Quirk Auto Dealers - Multi-Dealership Inventory Dashboard

A modern, real-time inventory management dashboard built for Quirk Auto Dealers, supporting multiple dealership locations across New Hampshire.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)
![Zustand](https://img.shields.io/badge/Zustand-5.0.3-orange.svg)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7.svg)

**Live Site:** [chevynhinventory.netlify.app](https://chevynhinventory.netlify.app/)

---

## ✨ Features

### Multi-Dealership Support
- **Dealership Selector** - Switch between Chevrolet and Buick GMC inventory
- **Separate Inventory Files** - Each dealership loads from its own Excel file
- **Per-Dealership Caching** - Independent cache for each dealership's data

### Advanced Filtering System
| Filter | Description |
|--------|-------------|
| **Dealership** | Toggle between Chevrolet and Buick GMC |
| **Year** | Filter by model year |
| **Make** | Filter by manufacturer (Buick, Chevrolet, GMC) |
| **Model** | Filter by vehicle model (cascades based on Make selection) |
| **Stock Number** | Search by partial or full stock number |
| **Search Inventory** | Free-text search across all fields |

### Smart Model Grouping
High-volume models are automatically split by Model Number for better organization:
- **Silverado 1500** → Silverado 1500 CK10543, Silverado 1500 CK10743, etc.
- **Silverado 2500HD** → Silverado 2500HD CK20743, Silverado 2500HD CK20753, etc.
- **Sierra 1500** → Sierra 1500 TK10543, Sierra 1500 TK10743, Sierra 1500 TK10753

### Inventory Health Dashboard
- **Fresh Inventory (0-30 days)** - Percentage and count of new stock
- **At-Risk Inventory (90+ days)** - Aging units requiring attention
- **Oldest Units List** - Quick access to longest-aged vehicles
- **New Arrivals Panel** - Vehicles on lot 7 days or less

### Vehicle Aging Analysis
Interactive aging buckets with drill-down capability:
- 🟢 **0-30 days** - Fresh inventory
- 🟡 **31-60 days** - Normal aging
- 🟠 **61-90 days** - Watch list
- 🔴 **90+ days** - At-risk inventory

### Additional Features
- **Real-Time Data** - Auto-loads Excel inventory with smart caching
- **Stale Data Indicator** - Shows when data needs refresh (5-minute threshold)
- **Interactive Charts** - Model distribution pie chart and aging visualization
- **Vehicle Detail Drawer** - Click any row for full vehicle specifications
- **In-Transit Tracking** - Separate view for vehicles not yet on lot
- **Mobile Responsive** - Card-based layout on small screens
- **Light/Dark Theme** - Toggle between display modes
- **CSV Export** - Download filtered inventory data

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3.1, TypeScript 5.7.3 |
| Build | Vite 6.0.7, Terser minification |
| State | Zustand 5.0.3 |
| Styling | Tailwind CSS 3.4.17 |
| Charts | Recharts 2.15.0 |
| Data | XLSX 0.18.5 |
| Performance | @tanstack/react-virtual 3.11.2 |
| Testing | Vitest 2.1.8, Testing Library |
| Deployment | Netlify (auto-deploy) |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Linting
npm run lint

# Bundle analysis
npm run analyze
```

---

## 📁 Data Format

### Inventory Files
Place inventory files in the `/public` directory:

| Dealership | File Path |
|------------|-----------|
| Chevrolet | `/public/inventory.xlsx` |
| Buick GMC | `/public/gmc-inventory.xlsx` |

### Required Columns

| Column | Type | Description |
|--------|------|-------------|
| Stock Number | string | Unique vehicle identifier |
| Year | number | Model year |
| Make | string | Manufacturer (Chevrolet, Buick, GMC) |
| Model | string | Model name (e.g., SILVERADO 1500, SIERRA 1500) |
| Exterior Color | string | Paint color |
| Trim | string | Trim level (e.g., LT, RST, DENALI) |
| Model Number | string | Model code (e.g., CK10543, TK10743) |
| Cylinders | number | Engine cylinder count |
| Age | number | Days on lot |
| MSRP | number | Vehicle price |
| Category | string | Status (e.g., "IN TRANSIT") |
| VIN | string | Vehicle Identification Number |

---

## 📂 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (ThemeToggle)
│   ├── ChartsSection    # Model distribution & aging charts
│   ├── DrilldownTable   # Expandable inventory groups
│   ├── FiltersBar       # Filter controls & dealership selector
│   ├── HeaderBar        # Hero image header
│   ├── InventoryHealthPanel  # Health metrics display
│   ├── InventoryTable   # Main data table
│   ├── KpiBar           # Key performance indicators
│   ├── NewArrivalsPanel # Recent inventory display
│   ├── OldestUnitsPanel # Aging inventory alerts
│   ├── StaleIndicator   # Data freshness indicator
│   └── VehicleDetailDrawer   # Vehicle specs sidebar
├── context/             # React context providers
│   └── ThemeContext     # Light/dark mode state
├── hooks/               # Custom React hooks
│   ├── useInventoryCache    # LocalStorage caching
│   ├── useInventoryLoader   # Data fetching & parsing
│   └── useMediaQuery        # Responsive breakpoints
├── store/               # Zustand state management
│   └── inventoryStore   # Global app state
├── styles/              # Modular CSS files
│   ├── theme.css        # Design tokens & theming
│   ├── layout.css       # Grid & layout systems
│   ├── components.css   # Component-specific styles
│   └── responsive.css   # Mobile breakpoints
├── utils/               # Helper functions
│   ├── formatCurrency   # Price formatting
│   ├── inventoryUtils   # Data transformation
│   └── vehicleUrl       # VIN Solutions URL builder
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
└── inventoryHelpers.ts  # Config & utility exports
```

---

## ⚙️ Configuration

### Adding a New Dealership

1. **Add inventory file** to `/public/` (e.g., `cadillac-inventory.xlsx`)

2. **Update types** in `src/types.ts`:
```typescript
export type DealerSource = "chevrolet" | "buick-gmc" | "cadillac";
```

3. **Add paths and labels** in `src/inventoryHelpers.ts`:
```typescript
export const INVENTORY_PATHS: Record<DealerSource, string> = {
  chevrolet: "/inventory.xlsx",
  "buick-gmc": "/gmc-inventory.xlsx",
  cadillac: "/cadillac-inventory.xlsx",
};

export const DEALER_LABELS: Record<DealerSource, string> = {
  chevrolet: "Chevrolet",
  "buick-gmc": "Buick GMC",
  cadillac: "Cadillac",
};
```

4. **Update FiltersBar** to include new option in `dealerOptions` array

### Adding Model Number Splitting

To split a high-volume model by Model Number, add it to the `SPLIT_BY_MODEL_NUMBER` array in both:
- `src/components/FiltersBar.tsx`
- `src/App.tsx`

```typescript
const SPLIT_BY_MODEL_NUMBER = ["SILVERADO 1500", "SILVERADO 2500HD", "SIERRA 1500", "NEW_MODEL"];
```

### Brand Colors

```typescript
// src/inventoryHelpers.ts
export const QUIRK_GREEN = "#16a34a";
export const POWDER_BLUE = "#5A6A82";
```

### Cache Settings

```typescript
// src/hooks/useInventoryLoader.ts
const STALE_TIME = 5 * 60 * 1000;   // 5 minutes - show refresh indicator
const CACHE_TIME = 30 * 60 * 1000;  // 30 minutes - cache expiration
```

---

## 🌐 Deployment

### Netlify (Recommended)
The project includes `netlify.toml` for automatic configuration:
- Push to `main` branch triggers auto-deploy
- SPA redirect rules included
- Build command: `npm run build`
- Publish directory: `dist`

### Manual Deployment
```bash
npm run build
# Upload contents of /dist to your hosting provider
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Interactive test UI
npm run test:ui
```

Test files are co-located with components:
- `*.test.ts` / `*.test.tsx`

---

## 📋 Recent Updates (v3.0.0)

- ✅ Multi-dealership support (Chevrolet + Buick GMC)
- ✅ Dealership dropdown selector
- ✅ Make filter (Buick, Chevrolet, GMC)
- ✅ Cascading Model dropdown based on Make selection
- ✅ Sierra 1500 split by Model Number (TK10543, TK10743, TK10753)
- ✅ Per-dealership inventory caching
- ✅ Streamlined filter bar layout
- ✅ Removed redundant "View All" button
- ✅ Reduced hero image height for better dashboard visibility

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 👤 Author

**Michael Palmer**  
AI Deployment & Solutions Specialist  
Quirk Auto Dealers

---

*Built for Quirk Auto Dealers - New England's Largest Automotive Group*
