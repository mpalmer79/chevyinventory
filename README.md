# ABC Motors – Inventory Intelligence Dashboard

A **production-grade inventory intelligence dashboard** built for automotive dealerships, supporting multi-rooftop operations. This system converts raw vehicle inventory data into **actionable, performance-aware insights** for merchandising, aging risk management, and operational decision-making.

This is not a demo dashboard. It is designed as a **scalable internal analytics platform** optimized for large datasets, real-world dealership workflows, and executive visibility.

---

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000.svg)

---

## Purpose & Design Goals

This dashboard is built to support:

- **Fast, reliable visibility** into dealership inventory health
- **Early detection of aging and stagnation risk**
- **High-volume data exploration** without performance degradation
- Both **operator-level execution** and **manager-level oversight**
- A UI that is **professional, neutral, and trustworthy**

The system prioritizes clarity, performance, and decision support over visual novelty.

---

## Core Capabilities

### Multi-Dealership Inventory
- Dealership selector (supports multiple rooftops)
- Independent Excel inventory sources per rooftop
- Per-dealership caching and isolation
- Seamless context switching without reload friction

---

### Inventory Intelligence & Aging Analysis
- Dynamic aging buckets with drill-down support
- Clear classification of inventory health:
  - 0–30 days (Fresh)
  - 31–60 days (Normal)
  - 61–90 days (Watch)
  - 90+ days (At Risk)
- Oldest units surfaced explicitly for intervention
- New arrivals highlighted for merchandising opportunity

---

### Advanced Filtering System

| Filter | Description |
|------|------------|
| Dealership | Toggle between rooftops |
| Year | Filter by model year |
| Make | Filter by vehicle make |
| Model | Cascades dynamically from Make |
| Stock Number | Partial or full search |

Filters are designed for **rapid narrowing**, not exhaustive querying.

---

### Smart Model Normalization
High-volume models are automatically split by model number to improve clarity and grouping accuracy.

Examples:
- Silverado 1500 → CK10543, CK10743
- Silverado 2500HD → CK20743, CK20753
- Sierra 1500 → TK10543, TK10743, TK10753

This reduces ambiguity and improves table readability at scale.

---

### KPI & Executive Visibility
- Inventory freshness percentage
- At-risk inventory counts
- Aging distribution summaries
- Clear separation between **signals** and **raw data**

KPIs are designed to support **daily decision-making**, not vanity metrics.

---

### Operator-Focused UX
- Virtualized tables for large inventories
- Vehicle detail drawer to avoid route churn
- In-transit inventory tracking
- Mobile-responsive layout with card-based fallbacks
- Light and dark themes with full component parity
- CSV export of filtered results

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3.1 with TypeScript 5.7.3 |
| Build Tool | Vite 6.0.7 |
| State Management | Zustand 5.0.3 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS 3.4.17 |
| Data Parsing | XLSX 0.18.5 |
| Visualization | Recharts 2.15.0 |
| Virtualization | @tanstack/react-virtual 3.11.2 |
| Testing | Vitest 2.1.8 + Testing Library |

---

## Architecture Overview

The application follows a **layered frontend architecture** optimized for scalability and performance.

### Architectural Principles
- Separation of concerns over convenience
- Predictable data flow
- Composition-first UI design
- Performance as a first-class constraint

---

## Data Flow

1. Inventory data is loaded through a dedicated loader hook
2. Data is normalized and cached per dealership
3. Shared state is coordinated through a centralized store
4. Components subscribe only to the state they require

This minimizes unnecessary re-renders and maintains responsiveness as datasets grow.

---

## Performance Strategy

- Virtualized rendering for large tables
- Memoized selectors and derived state
- Controlled component lifecycles
- Client-side caching to reduce recomputation
- Optimized image handling

The system is designed to remain responsive with **thousands of vehicles** loaded.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ABC-Motors-Inventory-report

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. **Inventory Data**: Place your Excel inventory files in the `/public` directory
2. **Dealership URLs**: Update `src/utils/vehicleUrl.ts` with your dealership website URLs
3. **Branding**: Customize colors in `tailwind.config.js` and `src/index.css`
4. **Logo**: Replace `public/abc-motors-logo.png` with your dealership logo

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Data Files

| Dealership | File Path | Purpose |
|------------|-----------|---------|
| Primary | `/public/inventory.xlsx` | Main dealership inventory |
| Secondary | `/public/gmc-inventory.xlsx` | Secondary rooftop inventory |

---

## UI & Design System

This project uses **shadcn/ui** built on Radix UI primitives for accessibility and consistency.

Key components:
- Button
- Select
- Card
- Badge
- Input
- Sheet (vehicle detail drawer)
- Label

### Design Philosophy
- Information density without clutter
- Visual consistency across states
- Clear affordances and feedback
- No novelty-driven animation

Motion is intentionally restrained and used only to communicate state changes.

---

## Testing Strategy

Testing focuses on **behavioral correctness and stability**, not snapshot validation.

Covered areas include:
- Inventory transformation logic
- KPI calculations
- Error boundaries
- Responsive behavior via media query hooks

---

## Extensibility

The codebase is structured to support future enhancements without architectural rewrites, including:

- Pricing strategy overlays
- Predictive aging models
- Role-based views (sales, management, executives)
- Real-time API-backed updates
- Multi-rooftop white-label deployments

---

## Customization Guide

### Changing Brand Colors

1. Update `tailwind.config.js`:
```js
brand: {
  primary: "#YOUR_PRIMARY_COLOR",
  "primary-dark": "#YOUR_DARK_VARIANT",
  "primary-light": "#YOUR_LIGHT_VARIANT",
}
```

2. Update `src/index.css` CSS variables to match

### Adding New Dealerships

1. Add new inventory file to `/public`
2. Update `src/inventoryHelpers.ts` with file path mapping
3. Update `src/utils/vehicleUrl.ts` with dealership URL

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

---

*ABC Motors Inventory Intelligence Dashboard - Built for automotive professionals*
