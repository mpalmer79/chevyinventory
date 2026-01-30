# Quirk Auto Dealers – Inventory Intelligence Dashboard

A **production-grade inventory intelligence dashboard** built for Quirk Auto Dealers, supporting multi-rooftop operations across New Hampshire. This system converts raw vehicle inventory data into **actionable, performance-aware insights** for merchandising, aging risk management, and operational decision-making.

This is not a demo dashboard. It is designed as a **scalable internal analytics platform** optimized for large datasets, real-world dealership workflows, and executive visibility.

---

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.1.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000.svg)
![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7.svg)

**Live Site:** https://chevynhinventory.netlify.app/

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Michael%20Palmer-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mpalmer1234/)

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
- Dealership selector (Chevrolet, Buick GMC)
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
| Make | Buick, Chevrolet, GMC |
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

This provides confidence during iteration without slowing development velocity.

---

## Extensibility

The codebase is structured to support future enhancements without architectural rewrites, including:

- Pricing strategy overlays
- Predictive aging models
- Role-based views (sales, management, executives)
- Real-time API-backed updates
- Multi-rooftop white-label deployments

---

## Non-Goals

To maintain clarity and long-term maintainability, this project intentionally avoids:
- Heavy animation frameworks
- Marketing-driven UI elements
- Overly opinionated styling
- Backend-specific assumptions

---

## Getting Started

```bash
npm install
npm run dev
Project Status

This repository represents a stable, extensible foundation rather than a finished product. It is suitable for:

Internal deployment

Iterative productization

Demonstrating senior-to-principal-level frontend engineering practices

License

MIT License – see LICENSE file

Author

Michael Palmer
AI Deployment & Solutions Specialist
Quirk Auto Dealers

Built for Quirk Auto Dealers – New England’s largest automotive group
