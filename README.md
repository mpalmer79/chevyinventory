# Quirk Auto Dealers – Inventory Intelligence Dashboard

A **production-grade inventory intelligence dashboard** built for Quirk Auto Dealers, supporting multi-rooftop operations across New Hampshire. This system converts raw vehicle inventory data into **actionable, performance-aware insights** for merchandising, aging risk management, and operational decision-making.

This is not a demo dashboard. It is designed as a **scalable internal analytics platform** optimized for large datasets, real-world dealership workflows, and executive visibility.

---

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-3.2.0-green.svg)
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
- **Oldest Units panel** - table view with full vehicle details (Color, Trim, Body, Age, MSRP)
- **New Arrivals panel** - sorted by age descending, showing vehicles ≤7 days on lot with complete details
- In-transit vehicles properly excluded from aging calculations

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
High-volume truck models are automatically split by body configuration for improved clarity and grouping accuracy. The Model dropdown displays user-friendly body style descriptions instead of raw model numbers.

Examples:
- Silverado 1500 CK10543 → **SILVERADO 1500 4WD CREW CAB 147" WB**
- Silverado 1500 CK10703 → **SILVERADO 1500 4WD REG CAB 126" WB**
- Silverado 2500HD CK20743 → **SILVERADO 2500HD 4WD CREW CAB 159" WB**
- Sierra 1500 TK10543 → **SIERRA 1500 4WD CREW CAB 147" WB**

All inventory tables now display the **Body** column (drive type, cab style, wheelbase) instead of raw Model Numbers for improved readability.

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

## Architecture Decision Records

This section documents **key architectural decisions**, their rationale, and accepted tradeoffs. These decisions prioritize long-term maintainability, performance, and clarity over short-term convenience.

### ADR-001: Frontend-First Architecture
**Decision:** Implement the system as a frontend-driven analytics application using local data ingestion.

**Rationale:**  
Dealership inventory data is frequently exported via spreadsheets and internal tools. A frontend-first approach enables rapid iteration, offline validation, and independence from backend availability.

**Tradeoffs:**  
- Requires careful client-side performance management  
- Limits real-time updates without future API integration  

---

### ADR-002: Zustand for State Management
**Decision:** Use Zustand instead of Redux or Context-heavy patterns.

**Rationale:**  
Zustand provides minimal boilerplate, predictable state access, and fine-grained subscriptions, which are critical for large, frequently updated datasets.

**Tradeoffs:**  
- Less opinionated structure than Redux  
- Requires discipline to avoid over-centralization  

---

### ADR-003: Virtualized Tables for Inventory Rendering
**Decision:** Use virtualized rendering for inventory tables.

**Rationale:**  
Inventory datasets regularly exceed hundreds or thousands of rows. Virtualization ensures consistent performance and responsiveness regardless of dataset size.

**Tradeoffs:**  
- Increased implementation complexity  
- Requires careful row height and layout management  

---

### ADR-004: Drawer-Based Detail Exploration
**Decision:** Use a slide-out drawer for vehicle detail views instead of route-based navigation.

**Rationale:**  
Operators frequently need to inspect multiple vehicles rapidly. Drawer-based exploration preserves context and reduces navigation friction.

**Tradeoffs:**  
- URL deep-linking is limited  
- Requires additional state coordination  

---

### ADR-005: Restrained Motion and Animation
**Decision:** Limit animation to state transitions and feedback only.

**Rationale:**  
This dashboard serves operational and executive users. Motion is used to clarify state changes, not to decorate or entertain.

**Tradeoffs:**  
- Less visual flair  
- Higher emphasis on hierarchy and layout clarity  

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

## Author

- Michael Palmer
- AI Deployment & Solutions Specialist
- Quirk Auto Dealers
- [![LinkedIn](https://img.shields.io/badge/LinkedIn-Michael%20Palmer-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mpalmer1234/)
