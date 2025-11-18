# Quirk Chevrolet NH Inventory Dashboard

A modern, real-time inventory management dashboard built specifically for Quirk Chevrolet in Manchester, New Hampshire. This application provides comprehensive vehicle inventory tracking, analytics, and visualization tools to help dealership staff make data-driven decisions.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-4.3.0-646cff.svg)

## 🚀 Features

### Core Functionality
- **Real-Time Inventory Tracking** - Load and parse Excel inventory files automatically
- **Smart Search** - Natural language search with voice input support via Web Speech API
- **Advanced Filtering** - Filter by model, year, and MSRP price range
- **Interactive Data Visualization** - Charts and graphs powered by Recharts
- **Vehicle Aging Analysis** - Track inventory age with automatic bucketing (0-30, 31-60, 61-90, 90+ days)
- **Drill-Down Capabilities** - Deep-dive into specific inventory segments
- **Mobile Responsive** - Optimized card-based layout for mobile devices
- **Vehicle Detail View** - Slide-out drawer with comprehensive vehicle information

### Dashboard Components
- **KPI Bar** - Quick metrics for total units and new arrivals
- **Model Distribution Charts** - Visual breakdown of inventory by model
- **Aging Bucket Visualization** - See inventory health at a glance
- **Inventory Health Panel** - Identify at-risk units and models with high average age
- **New Arrivals Panel** - Highlight fresh inventory (7 days or newer)
- **Interactive Tables** - Sortable, clickable inventory listings
- **Export Functionality** - CSV export for external analysis

## 🛠️ Tech Stack

### Frontend
- **React 18.2.0** - UI component library
- **TypeScript 5.0.0** - Type-safe development
- **Vite 4.3.0** - Next-generation build tool
- **Tailwind CSS 3.3.2** - Utility-first CSS framework

### Data & Visualization
- **XLSX 0.18.5** - Excel file parsing
- **Recharts 2.7.2** - Chart components

### Deployment
- **Netlify** - Continuous deployment platform
- **PostCSS + Autoprefixer** - CSS optimization

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- Modern web browser with Web Speech API support (Chrome, Edge recommended)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mpalmer79/chevyinventory-main.git
   cd chevyinventory-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Prepare your inventory data**
   - Place your inventory Excel file at `/public/inventory.xlsx`
   - Ensure the file contains the required columns (see Data Format section)

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The dashboard should load with your inventory data

## 📊 Data Format

Your inventory Excel file (`/public/inventory.xlsx`) must include these columns:

| Column Name | Type | Description |
|------------|------|-------------|
| Stock Number | string | Unique vehicle identifier |
| Year | number | Vehicle model year |
| Make | string | Vehicle manufacturer |
| Model | string | Vehicle model name |
| Exterior Color | string | Exterior paint color |
| Trim | string | Trim level/package |
| Model Number | string | Specific model identifier |
| Cylinders | number | Engine cylinder count |
| Short VIN | string | Last 8 digits of VIN |
| Age | number | Days on lot |
| MSRP | number | Manufacturer's suggested retail price |

**Example:**
```
Stock Number | Year | Make      | Model        | Exterior Color | Trim | Age | MSRP
C12345      | 2024 | Chevrolet | Silverado 1500 | Summit White   | LT   | 15  | 45000
```

## 🎯 Usage

### Searching for Vehicles

**Text Search:**
- Type naturally: "I'm looking for a red truck"
- The system extracts keywords and filters automatically

**Voice Search:**
- Click the microphone icon in the header
- Speak your search query clearly
- The system will transcribe and filter results

### Filtering Inventory

1. **By Model** - Select from dropdown (all Chevrolet models in stock)
2. **By Year** - Choose specific year or "ALL"
3. **By Price Range** - Enter minimum and/or maximum MSRP
4. Click **SEARCH** to apply filters

### Analyzing Inventory Health

**Aging Buckets:**
- **Green (0-30 days)** - Fresh inventory, optimal turnover
- **Yellow (31-60 days)** - Normal aging range
- **Orange (61-90 days)** - Requires attention
- **Red (90+ days)** - At-risk, immediate action needed

**Click any bucket** in the aging chart to drill down into that segment.

### Viewing Vehicle Details

- Click any row in the inventory table
- A detailed drawer slides in from the right
- View complete vehicle specifications
- Close with X button or click outside

## 📁 Project Structure

```
chevyinventory-main/
├── public/
│   └── inventory.xlsx          # Your inventory data file
├── src/
│   ├── components/             # React components
│   │   ├── ChartsSection.tsx   # Chart visualizations
│   │   ├── DrilldownTable.tsx  # Grouped inventory view
│   │   ├── FiltersBar.tsx      # Filter controls
│   │   ├── HeaderBar.tsx       # Top navigation
│   │   ├── InventoryHealthPanel.tsx  # Health metrics
│   │   ├── InventoryTable.tsx  # Main data table
│   │   ├── KpiBar.tsx          # Key metrics
│   │   ├── NewArrivalsPanel.tsx # Recent additions
│   │   └── VehicleDetailDrawer.tsx # Detail view
│   ├── hooks/
│   │   └── useInventoryData.ts # Data loading hook
│   ├── styles/                 # Modular CSS
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── filters.css
│   │   ├── tables.css
│   │   └── responsive.css
│   ├── utils/
│   │   └── formatCurrency.ts   # Helper functions
│   ├── App.tsx                 # Main component
│   ├── types.ts                # TypeScript definitions
│   ├── inventoryHelpers.ts     # Utility functions
│   └── index.jsx               # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── netlify.toml
└── README.md
```

## 🔨 Build Commands

### Development
```bash
npm run dev        # Start dev server (http://localhost:5173)
```

### Production
```bash
npm run build      # Build for production (outputs to /dist)
npm run preview    # Preview production build locally
```

## 🚀 Deployment

### Netlify (Recommended)

This project is configured for one-click Netlify deployment.

1. **Connect to Netlify**
   - Log in to [Netlify](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are pre-configured in `netlify.toml`

3. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be live at `https://your-site-name.netlify.app`

4. **Continuous Deployment**
   - Push to your main branch to trigger automatic rebuilds

### Manual Deployment

For other hosting platforms:

```bash
npm run build
# Upload contents of /dist folder to your hosting provider
```

## ⚙️ Configuration

### Customizing Colors

Edit `src/inventoryHelpers.ts`:

```typescript
export const QUIRK_GREEN = "#16a34a";  // Primary brand color
export const POWDER_BLUE = "#5A6A82";  // Silverado 1500 accent
```

### Changing Inventory File Path

Edit `src/inventoryHelpers.ts`:

```typescript
export const DEFAULT_INVENTORY_PATH = "/inventory.xlsx";
// Change to your preferred path
```

### Adjusting Aging Thresholds

Edit `src/App.tsx` - Modify the `agingBuckets` calculation:

```typescript
const agingBuckets = useMemo<AgingBuckets>(() => {
  const b = {
    bucket0_30: 0,    // Fresh threshold
    bucket31_60: 0,   // Normal threshold
    bucket61_90: 0,   // Warning threshold
    bucket90_plus: 0, // At-risk threshold
  };
  // ... calculation logic
}, [rows]);
```

## ⚠️ Known Issues

### Critical Issues (Must Fix Before Production)

1. **HeaderBar Props Mismatch** ⚠️
   - **Location:** `src/components/HeaderBar.tsx` vs `src/App.tsx`
   - **Issue:** HeaderBar component expects `searchTerm` and `onSearchChange` props but none are passed
   - **Impact:** Search functionality broken
   - **Fix:** Pass required props or refactor HeaderBar to remove props

2. **Incomplete Year Filter** ⚠️
   - **Location:** `src/components/FiltersBar.tsx` line 79
   - **Issue:** Year dropdown has placeholder comment but no actual year options
   - **Impact:** Year filtering non-functional
   - **Fix:** Add year options (2020-2025)

### Browser Compatibility

- Voice search requires Web Speech API (Chrome, Edge with webkit)
- Falls back to manual input on unsupported browsers

## 🧪 Testing

Currently, this project does not include automated tests. Recommended additions:

```bash
# Recommended testing setup
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

Create test files:
- Component tests: `*.test.tsx`
- Integration tests: `*.integration.test.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new files
- Follow existing naming conventions
- Add comments for complex logic
- Test on both desktop and mobile viewports
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License
Copyright (c) 2025 mpalmer79
```

## 👤 Author

**Michael Palmer**
- GitHub: [@mpalmer79](https://github.com/mpalmer79)
- Organization: Quirk Automotive Group

## 🙏 Acknowledgments

- Built for Quirk Chevrolet Manchester NH
- Powered by Vite and React
- Charts by Recharts
- Deployed on Netlify

## 📞 Support

For questions or issues:
1. Check existing [GitHub Issues](https://github.com/mpalmer79/chevyinventory-main/issues)
2. Create a new issue with detailed description
3. Contact the development team at Quirk Auto Dealers

---

**Built with ❤️ for Quirk Chevrolet Manchester NH**
