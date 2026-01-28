# Quirk Chevrolet NH Inventory Dashboard

A modern, real-time inventory management dashboard built for Quirk Chevrolet in Manchester, New Hampshire.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)
![Zustand](https://img.shields.io/badge/Zustand-5.0.3-orange.svg)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7.svg)

**Live Site:** [chevynhinventory.netlify.app](https://chevynhinventory.netlify.app/)

## Features

- **Real-Time Inventory Tracking** - Auto-loads Excel inventory with caching
- **Smart Search** - Natural language + voice input (Web Speech API)
- **Advanced Filtering** - Model, year, MSRP with URL sync for shareable links
- **Vehicle Aging Analysis** - Buckets: 0-30, 31-60, 61-90, 90+ days
- **Interactive Charts** - Model distribution and aging visualization
- **Mobile Responsive** - Card layout on small screens
- **Vehicle Detail Drawer** - Click any row for full specs

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.3.1, TypeScript 5.7.3 |
| Build | Vite 6.0.7, Terser minification |
| State | Zustand 5.0.3 |
| Styling | Tailwind CSS 3.4.17 |
| Charts | Recharts 2.15.0 |
| Data | XLSX 0.18.5 |
| Performance | @tanstack/react-virtual 3.11.2 |
| Deployment | Netlify |

## Quick Start
```bash
# Install
npm install

# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview

# Run tests
npm run test

# Bundle analysis
npm run analyze
```

## Data Format

Place your inventory file at `/public/inventory.xlsx` with these columns:

| Column | Type | Description |
|--------|------|-------------|
| Stock Number | string | Unique identifier |
| Year | number | Model year |
| Make | string | Manufacturer |
| Model | string | Model name |
| Exterior Color | string | Paint color |
| Trim | string | Trim level |
| Model Number | string | Model code |
| Cylinders | number | Engine cylinders |
| Age | number | Days on lot |
| MSRP | number | Price |
| Status | string | e.g., "IN TRANSIT" |
| VIN | string | Vehicle ID |

## Project Structure
```
src/
├── components/        # React components
├── hooks/             # Custom hooks
├── store/             # Zustand state management
├── styles/            # Modular CSS
├── utils/             # Helper functions
├── App.tsx            # Main component
└── types.ts           # TypeScript definitions
```

## Configuration

**Brand colors** - `src/inventoryHelpers.ts`:
```typescript
export const QUIRK_GREEN = "#16a34a";
```

**Inventory path** - `src/inventoryHelpers.ts`:
```typescript
export const DEFAULT_INVENTORY_PATH = "/inventory.xlsx";
```

## Deployment

Configured for Netlify with `netlify.toml`. Push to main branch for auto-deploy.

## License

MIT License - see [LICENSE](LICENSE)

## Author

**Michael Palmer** - [@mpalmer79](https://github.com/mpalmer79)

---

*Built for Quirk Chevrolet Manchester NH*
