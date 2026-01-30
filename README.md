[README.md](https://github.com/user-attachments/files/24967188/README.md)[Uploading README.m# Quirk Auto Dealers NH - Multi-Dealership Inventory Dashboard

A modern, real-time inventory management dashboard built for Quirk Auto Dealers, supporting multiple dealership locations across New Hampshire.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.1.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000.svg)
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
| **UI Components** | **shadcn/ui + Radix UI** |
| Styling | Tailwind CSS 3.4.17, tailwindcss-animate |
| Icons | Lucide React |
| Charts | Recharts 2.15.0 |
| Data | XLSX 0.18.5 |
| Performance | @tanstack/react-virtual 3.11.2 |
| Testing | Vitest 2.1.8, Testing Library |
| Deployment | Netlify (auto-deploy) |

---

## 🎨 Design System (shadcn/ui)

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives:

| Component | Usage |
|-----------|-------|
| **Button** | Primary actions, variants for success/destructive |
| **Select** | Dropdown filters with search & scroll |
| **Card** | KPI cards, chart containers, detail panels |
| **Badge** | Status indicators (Fresh, Normal, Watch, At Risk) |
| **Input** | Stock number search, form inputs |
| **Sheet** | Vehicle detail drawer (slide-out panel) |
| **Label** | Form field labels |

### Customizations
- Brand colors: Chevy Blue (#0066B1), Quirk Green (#16a34a)
- Status variants: Fresh (emerald), Normal (yellow), Watch (orange), Risk (red)
- Dark mode with full component support

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

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx       # Button with variants
│   │   ├── badge.tsx        # Status badges
│   │   ├── card.tsx         # Card container
│   │   ├── input.tsx        # Text input
│   │   ├── label.tsx        # Form labels
│   │   ├── select.tsx       # Dropdown select
│   │   ├── sheet.tsx        # Slide-out drawer
│   │   ├── ThemeToggle.tsx  # Light/dark toggle
│   │   └── index.ts         # Component exports
│   ├── ChartsSection.tsx    # Model distribution & aging charts
│   ├── DrilldownTable.tsx   # Expandable inventory groups
│   ├── FiltersBar.tsx       # Filter controls & dealership selector
│   ├── HeaderBar.tsx        # Hero image header
│   ├── InventoryHealthPanel.tsx
│   ├── InventoryTable.tsx   # Main data table
│   ├── KpiBar.tsx           # Key performance indicators
│   ├── NewArrivalsPanel.tsx
│   ├── OldestUnitsPanel.tsx
│   ├── StaleIndicator.tsx
│   └── VehicleDetailDrawer.tsx
├── context/
│   └── ThemeContext.tsx     # Light/dark mode state
├── hooks/
│   ├── useInventoryCache.ts
│   ├── useInventoryLoader.ts
│   └── useMediaQuery.ts
├── lib/
│   └── utils.ts             # cn() helper for className merging
├── store/
│   └── inventoryStore.ts    # Zustand global state
├── styles/
│   └── theme.css            # Legacy CSS variables
├── utils/
├── App.tsx
├── types.ts
├── inventoryHelpers.ts
└── index.css                # Tailwind + shadcn CSS variables
```

---

## 📋 Recent Updates

### v3.1.0 (January 30, 2026)
- ✅ **shadcn/ui Design System Migration**
  - Radix UI primitives for accessible components
  - Button, Select, Card, Badge, Input, Sheet, Label components
  - Lucide React icons
  - tailwindcss-animate for smooth transitions
- ✅ Updated KPI cards with modern card design
- ✅ Vehicle detail drawer using Sheet component
- ✅ Aging buckets with interactive hover states
- ✅ Improved theme toggle with segmented control

### v3.0.0 (January 29, 2026)
- Multi-dealership support (Chevrolet + Buick GMC)
- Dealership dropdown selector
- Make filter (Buick, Chevrolet, GMC)
- Cascading Model dropdown based on Make selection
- Sierra 1500 split by Model Number
- Per-dealership inventory caching
- Streamlined filter bar layout

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
d…]()
