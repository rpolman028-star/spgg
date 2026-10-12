# 7-Day Food Distribution Trend Charts (Admin View)

Comprehensive implementation plan to integrate interactive Recharts visualizations for tracking and analyzing 7-day meal portion distributions within the SPPG Polewali Mandar MBG portal.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were completed with recommended defaults. Here are the core specifications:
> - **Placement**: Integrated into the **Admin Management Modal** under a dedicated tab (`Grafik Tren`), with an expandable quick-view widget in the main `DistributionPortions` section for authenticated admins.
> - **Chart Style**: Responsive **Stacked Area Chart** with smooth gradients and custom tooltips displaying category breakdowns (Porsi Besar, Porsi Kecil, Porsi Balita), alongside a toggle for **Bar Chart** comparison.
> - **Data Persistence**: A 7-day historical dataset initialized from current and scheduled menu data, with an inline editable table allowing admins to fine-tune daily totals.

---

### 1. Overview & Core Concept

- **What It Does**: Provides SPPG administrators and logistics supervisors with an intuitive visual dashboard tracking food portion distributions over the preceding 7 days.
- **Target Audience**: SPPG Polewali Mandar kitchen managers, nutrition supervisors, and school coordinators.
- **Key Value**: Delivers immediate visibility into distribution volume trends, day-to-day variance, category balance (large vs. small vs. toddler portions), and weekly throughput totals without requiring manual spreadsheet calculations.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Admin Access**:
   - Authorized admin logs in through "Akses Petugas SPPG" or URL.
   - The top "Update Data" button and in-page admin controls become active.
2. **Interactive Chart View in Admin Modal**:
   - Admin opens "Update Data" modal and clicks the new **"Grafik Tren"** tab.
   - Overview KPI cards show:
     - **Total 7 Hari**: Cumulative sum of portions distributed over the week.
     - **Rata-rata Harian**: Daily average distribution.
     - **Puncak Distribusi**: Date and volume of the highest distribution day.
   - The Recharts visualizer renders dynamically with smooth bezier curves and soft gradient fills.
   - Hovering over data points presents a high-precision tooltip showing exact counts for each portion category and verification status.
   - Admins can toggle between **Area (Komposisi)** and **Bar (Perbandingan Harian)** views.
3. **Editable 7-Day History Table**:
   - Below the chart, an editable data table allows adjusting any day's numbers (Total, Porsi Besar, Porsi Kecil, Porsi Balita, Status).
   - "Simpan Perubahan" persists the updated trend history into state and storage.
4. **Quick-View Widget on Main Page (Admin Only)**:
   - For logged-in admins, the `DistributionPortions` card includes an expandable "Lihat Grafik Tren 7 Hari" toggle for instant inspection without opening the modal.

#### Visual Identity & Theme
- **Theme Matching**: Seamless alignment with the official MBG portal design tokens (Navy `#0B1B3D`, Royal Blue `#0047AB`, Emerald `#16A34A`, Amber `#D97706`).
- **Typography & Tabular Numerals**: Strict usage of `tabular-nums font-mono` for all numeric values and timestamps to prevent layout jitter.
- **Chart Styling**: Clean SVG rendering, subtle horizontal grid lines (`stroke="#E2E8F0"`), rounded tooltip containers with elevation, and clear color legend keys.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Recharts Integration**:
  - *Chosen Approach*: Install and leverage `recharts` (`ResponsiveContainer`, `AreaChart`, `Area`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`).
  - *Why*: Battle-tested React charting library with built-in responsive scaling, rich animation support, and seamless Tailwind CSS coexistence.
- **Decision 2: Dual Access Points (Modal Tab + Collapsible Card)**:
  - *Chosen Approach*: Full editing & KPI analysis in `AdminMenuEditorModal`, with a lightweight collapsible chart preview in `DistributionPortions`.
  - *Why*: Keeps the public visitor experience clean and untampered, while giving administrators both deep configuration tools and quick in-context visibility.
- **Decision 3: Realistic Initial 7-Day Dataset**:
  - *Chosen Approach*: Seed 7 realistic daily records culminating in the current active date (accounting for weekend shifts and typical SPPG operational cycles).
  - *Why*: Guarantees instant utility upon activation without requiring empty-state manual data entry from day one.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   App.tsx (Root State)                 │
│  - currentMenu (DailyMenuData with distributionHistory)│
│  - isAdmin (Authentication status)                     │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────────┐    ┌───────────────────────────────────┐
│ DistributionPortions.tsx  │    │ AdminMenuEditorModal.tsx          │
│ - 3 Metric Cards          │    │ - Tab 1..7: Info, Foto, etc.      │
│ - Admin Collapsible Chart │    │ - Tab 8: "Grafik Tren" (Recharts) │
│   (DistributionTrendChart)│    │   - KPI Summary Cards             │
└───────────────────────────┘    │   - Interactive Area/Bar Chart    │
                                 │   - 7-Day History Editor Table    │
                                 └───────────────────────────────────┘
```

#### Data Entities & Extensions
```typescript
export interface DailyDistributionHistoryItem {
  dateKey: string;          // e.g., "2026-10-05"
  dayLabel: string;         // e.g., "Senin, 05 Okt"
  total: number;            // Total portions
  porsiBesar: number;       // Large portions (SMP/SMA)
  porsiKecil: number;       // Small portions (SD)
  porsiBalita: number;      // Toddler & preschool portions
  status: 'Tervalidasi' | 'Dalam Proses' | 'Terjadwal';
}
```

#### Implementation Steps
1. Install `recharts` package via `install_applet_package`.
2. Extend TypeScript definitions in `src/types/index.ts` with `DailyDistributionHistoryItem` and include `distributionHistory?: DailyDistributionHistoryItem[]` in `DailyMenuData`.
3. Provide default 7-day historical dataset in `src/data/menuData.ts`.
4. Create dedicated reusable component `src/components/DistributionTrendChart.tsx` with responsive layout, custom tooltip, and view toggle.
5. Add the **"Grafik Tren"** tab into `src/components/AdminMenuEditorModal.tsx` with KPI summary cards, interactive chart, and historical data editor.
6. Add the optional collapsible chart toggle into `src/components/DistributionPortions.tsx` for logged-in admins.
7. Verify build and linting via `compile_applet`.
