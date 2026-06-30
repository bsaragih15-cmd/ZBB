# PRD: MIND ID Control Tower
**Product Requirements Document**
**Version:** 1.0 | **Status:** Draft | **Date:** June 2026

---

## 1. Summary

The MIND ID Control Tower is a unified digital command center for Mining Industry Indonesia (MIND ID), the state-owned mining holding company overseeing PT ANTAM, PT Bukit Asam, PT Freeport Indonesia, PT INALUM, PT Timah, and PT Vale Indonesia. It consolidates real-time data on production, sales, finance, safety, and ESG across all subsidiaries into a single intelligent dashboard — giving MIND ID leadership full visibility and faster decision-making power across Indonesia's most strategic mining portfolio.

---

## 2. Contacts

| Name | Role | Responsibility |
|------|------|----------------|
| TBD | Product Owner (MIND ID Corporate) | Strategic direction, stakeholder alignment |
| TBD | CIO / Head of Digital Transformation | Technology oversight |
| TBD | CFO Representative | Financial KPI requirements |
| TBD | COO Representatives (per subsidiary) | Operational data requirements |
| TBD | Head of HSE (Health, Safety, Environment) | Safety and ESG metrics |
| TBD | Data Engineering Lead | Integration architecture |
| TBD | UX Lead | Dashboard design and usability |

---

## 3. Background

### What is this about?
MIND ID manages one of Southeast Asia's largest mining portfolios — spanning copper, gold, coal, nickel, tin, bauxite, and aluminium across 6 subsidiary companies and dozens of operational sites across Indonesia. Today, each subsidiary runs its own reporting systems, dashboards, and data silos. The corporate holding team at MIND ID has no single live view of the group's performance.

### Why now?
Three things have changed:

1. **Scale has grown rapidly.** MIND ID became the largest shareholder of PT Vale in 2024, bringing a sixth major subsidiary into the portfolio. The group now manages 5 strategic downstream projects simultaneously in 2025 (SGAR Phase II, RKEF & HPAL East Halmahera, PMR, PLTG Gresik, and three nickel projects in Sulawesi).

2. **The government expects more accountability.** As a BUMN (state-owned enterprise), MIND ID faces increasing pressure from the Ministry of SOEs to show transparent, real-time performance data across all subsidiaries.

3. **MIND ID already has the building blocks.** The company has begun digitizing operations (AI, IoT, remote monitoring at Freeport, Bukit Asam, ANTAM). The Control Tower is the logical next layer — aggregating what's already being measured into one place.

### The gap today
Without a Control Tower, corporate leadership learns about operational problems days or weeks after they happen, through manual reports. Decisions are slow. Risks are hidden. Cross-subsidiary synergies go uncaptured.

---

## 4. Objective

### What we want to achieve
Give MIND ID's corporate leadership and Board a live, trusted view of the entire group's performance — production, financial, safety, and ESG — so they can act fast, allocate resources wisely, and report to the government with confidence.

### Why it matters
- **For MIND ID:** Reduce the time to detect operational problems from days to minutes. Enable smarter capital allocation across subsidiaries.
- **For Indonesia:** Maximize value extraction from national mineral resources. Support the government's downstream (hilirisasi) agenda with real data.
- **For subsidiaries:** Replace duplicated reporting effort with automated feeds. Get benchmarked against peers to drive healthy competition.

### Key Results (SMART OKRs)

| # | Objective | Key Result | Timeline |
|---|-----------|------------|----------|
| 1 | Unified visibility | 100% of subsidiaries live on the Control Tower | 12 months post-launch |
| 2 | Faster decisions | Reduce time-to-escalate operational incidents from 48 hrs → 4 hrs | 6 months post-launch |
| 3 | Report efficiency | Eliminate 80% of manual monthly reporting effort at corporate level | 12 months post-launch |
| 4 | Safety improvement | HSE incidents flagged and acknowledged within 1 hour across all sites | 9 months post-launch |
| 5 | Data trust | 95% data accuracy score across all connected feeds (vs. manual reports) | 12 months post-launch |

---

## 5. Market Segment

### Who are we building this for?

**Primary users — MIND ID Corporate Team:**
- Board of Directors and President Director (strategic overview)
- CFO and Finance team (group-level P&L, cash flow, capex tracking)
- COO / Operations team (production volumes, efficiency, downtime)
- Head of HSE (safety incidents, environmental compliance)
- Investor Relations (ESG reporting, sustainability metrics)

**Secondary users — Subsidiary Leadership:**
- Directors of PT ANTAM, PT Bukit Asam, PT Freeport Indonesia, PT INALUM, PT Timah, PT Vale Indonesia
- Operational managers at site level who feed data in

**Constraints:**
- Users are spread across Jakarta HQ and remote mining sites (Papua, Sulawesi, Kalimantan, Bangka, Sumatra) — must work on low-bandwidth connections
- Mix of technical and non-technical users — must be usable without training
- Data sovereignty: all data must stay within Indonesian jurisdiction (on-premise or local cloud)
- Each subsidiary has different ERP/SCADA systems — integration must be flexible

---

## 6. Value Propositions

### What problems does the Control Tower solve?

| Customer Job | Today's Pain | What They Gain |
|---|---|---|
| Monitor group production | Call each subsidiary for updates | Live dashboard, auto-refreshed |
| Catch operational problems early | Learn about issues from weekly reports | Alerts within minutes of threshold breach |
| Prepare board presentations | 3-week manual data consolidation | Auto-generated board pack with live data |
| Track downstream project progress | Fragmented project updates | Unified project milestone tracker |
| Prove ESG performance to government | Manual ESG reports, risk of error | Automated ESG score with audit trail |
| Benchmark subsidiaries | No apples-to-apples comparison | Peer ranking across KPIs |
| Allocate capital across portfolio | Based on gut feel + old reports | Data-driven allocation with scenario modeling |

### Why better than alternatives?
- Existing BI tools (Power BI, Tableau) require each subsidiary to push data manually — no real-time automation
- Generic ERP dashboards (SAP) only cover financial data, not production or safety
- The MIND ID Control Tower is purpose-built for a **mining holding company** — it understands ore grades, mining cycles, pit-to-port flows, and BUMN reporting requirements

---

## 7. Solution

### 7.1 UX / Key Screens

**Screen 1 — Group Overview (The "War Room" View)**
- Top: 6 subsidiary cards showing traffic-light status (green/yellow/red) for Production, Finance, Safety
- Middle: Live production volumes by commodity (copper, gold, coal, nickel, tin, bauxite, aluminium) in tonnes and % vs. target
- Bottom: Financial summary — revenue, EBITDA, cash position vs. plan
- Right panel: Active alerts ranked by severity

**Screen 2 — Subsidiary Deep Dive**
- Click any subsidiary card → full operational profile
- Production: daily/weekly/monthly actual vs. plan, trend chart
- Financial: P&L waterfall, capex burn rate
- Safety: LTIFR (Lost Time Injury Frequency Rate), near-misses, open corrective actions
- Projects: downstream project milestones (RAG status)

**Screen 3 — Commodity Intelligence**
- Live commodity price feed (LME copper, gold spot, coal benchmark, nickel, tin)
- Revenue-at-risk calculator: if price drops X%, group revenue impact
- Cross-subsidiary commodity exposure map

**Screen 4 — ESG Dashboard**
- Carbon emissions (Scope 1 & 2) per subsidiary
- Water consumption and recycling rates
- Community investment (CSR spend)
- Regulatory compliance status per site
- Auto-export to OJK / Ministry of SOEs report format

**Screen 5 — Alerts & Escalation Center**
- All active alerts across subsidiaries in one feed
- Each alert: severity, site, description, time elapsed, owner assigned
- One-click escalate to WhatsApp / email / Teams

**Screen 6 — Board Pack Generator**
- Select period → auto-generate slide deck with live data
- Editable before export
- Output: PowerPoint + PDF

---

### 7.2 Key Features

#### F1 — Multi-Source Data Integration Hub
- Connectors to: SAP (ANTAM, Bukit Asam), Oracle (INALUM), custom SCADA systems (Freeport), operational databases (Timah, Vale)
- Real-time sync for production data (15-minute intervals)
- Daily sync for financial data
- API-first architecture — new subsidiaries can be onboarded in weeks
- Data validation layer flags inconsistencies before they reach dashboards

#### F2 — Intelligent Alerting Engine
- Configurable KPI thresholds per subsidiary per metric
- Escalation paths: site manager → subsidiary director → MIND ID corporate → Board
- Alert channels: in-app, WhatsApp Business API, email, SMS
- Alert fatigue prevention: smart grouping, snooze, acknowledgment tracking

#### F3 — Unified KPI Framework
- Standardized metrics agreed across all 6 subsidiaries
- Production: ore mined (t), processed (t), recovery rate (%), stripping ratio
- Financial: revenue (IDR/USD), EBITDA, net profit, capex vs. budget
- Safety: LTIFR, TRIFR, fatalities, near-miss count
- ESG: CO₂ (tCO₂e), energy intensity, water intensity, community spend

#### F4 — Scenario & Sensitivity Modeler
- "What if" tool: change commodity price or production volume → see group-level impact
- Used by CFO team for budget planning and stress testing
- Shareable scenarios with commentary

#### F5 — Downstream Project Tracker
- Gantt-style milestone view for 5 priority projects (SGAR II, RKEF-HPAL, PMR, PLTG, Nickel Sulawesi)
- Budget vs. actual spend per project
- Risk register with owner and mitigation status
- Linked to physical progress reports from project teams

#### F6 — Regulatory & Compliance Module
- RKAB (Rencana Kerja dan Anggaran Biaya) tracking — mining work plan vs. actual
- IUP (mining license) expiry calendar with renewal reminders
- Environmental permit compliance tracker
- Auto-formatted reports for ESDM (Ministry of Energy and Mineral Resources)

#### F7 — Mobile App (Read-Only)
- iOS and Android
- Board-level summary view — 5 key metrics per subsidiary
- Push notifications for critical alerts
- Works offline (last-synced data available)
- Biometric login (FaceID / fingerprint)

#### F8 — Role-Based Access Control
- 5 access tiers: Board, Corporate Executive, Subsidiary Director, Site Manager, Viewer
- Each tier sees only their permitted data
- Full audit log of who viewed/exported what

---

### 7.3 Technology

| Layer | Approach |
|-------|----------|
| Data ingestion | Apache Kafka (real-time streams) + REST API connectors |
| Data warehouse | Snowflake or BigQuery (hosted in Indonesian data center) |
| Processing | dbt for transformations, Apache Airflow for orchestration |
| Backend | Python FastAPI microservices |
| Frontend | React + TypeScript, responsive web + PWA |
| Mobile | React Native (iOS + Android) |
| Alerting | Custom rules engine + WhatsApp Business API + SMTP |
| Auth | SSO via Microsoft Entra ID (MIND ID already uses M365) |
| Hosting | On-premise at MIND ID data center OR Telkom Indonesia Nusantara Data Center (for data sovereignty) |
| Security | End-to-end encryption, ISO 27001 compliance target |

---

### 7.4 Assumptions

| # | Assumption | Risk if Wrong |
|---|-----------|---------------|
| A1 | Each subsidiary will assign a data integration owner to support API/connector setup | High — integration will stall without subsidiary cooperation |
| A2 | Subsidiaries have stable, queryable data sources (ERP, SCADA) — not only spreadsheets | High — manual data entry degrades real-time value |
| A3 | MIND ID corporate team will agree on a unified KPI framework within 3 months | Medium — without alignment, dashboard becomes a patchwork |
| A4 | Indonesian cloud/on-prem infrastructure can support 15-minute data refresh cycles | Medium — latency at remote sites (Papua, Bangka) may be a constraint |
| A5 | Board and executives will adopt the tool for actual decision-making (not just reporting) | High — adoption is the biggest risk to value realization |

---

## 8. Release Plan

### Phase 1 — Foundation (Months 1–6)
**Goal:** Get 3 subsidiaries live with core production + financial dashboards

- Deliverables:
  - Data integration connectors for PT ANTAM, PT Bukit Asam, PT Freeport Indonesia
  - Group Overview screen (F1, F2, F3)
  - Role-based access control (F8)
  - Web app (desktop-first)
  - Alert engine for production and safety KPIs (F2)

- Success metric: Corporate team gets daily automated group report (replacing manual consolidation)

---

### Phase 2 — Full Coverage (Months 7–12)
**Goal:** All 6 subsidiaries live; ESG and project tracking added

- Deliverables:
  - Onboard PT INALUM, PT Timah, PT Vale Indonesia
  - ESG Dashboard (F6)
  - Downstream Project Tracker (F5)
  - Board Pack Generator (F6)
  - Mobile app (F7)
  - Commodity Intelligence screen

- Success metric: Board receives auto-generated monthly pack; ESG data ready for OJK submission

---

### Phase 3 — Intelligence Layer (Months 13–18)
**Goal:** Move from monitoring to prediction and optimization

- Deliverables:
  - Scenario & Sensitivity Modeler (F4)
  - Predictive alerts (ML-based anomaly detection)
  - Regulatory compliance module (F6 full)
  - API open to subsidiary BI teams for self-serve analytics
  - Benchmarking league table across subsidiaries

- Success metric: CFO uses scenario modeler for quarterly budget reforecast

---

## Appendix: MIND ID Subsidiary Quick Reference

| Subsidiary | Commodity | Key Sites |
|------------|-----------|-----------|
| PT ANTAM Tbk | Nickel, Gold, Bauxite, Silver | Halmahera, Pongkor, Kalimantan |
| PT Bukit Asam Tbk | Coal | Tanjung Enim (South Sumatra) |
| PT Freeport Indonesia | Copper, Gold, Silver | Grasberg (Papua) |
| PT INALUM (Persero) | Aluminium | Kuala Tanjung (North Sumatra) |
| PT Timah Tbk | Tin | Bangka Belitung |
| PT Vale Indonesia Tbk | Nickel | Sorowako (South Sulawesi) |

---

*PRD authored with MIND ID Control Tower skill — June 2026*
*Sources: [MIND ID Official](https://mind.id/en) | [MIND ID 2024 Performance](https://mind.id/en/news/pertumbuhan-laba-46-mind-id-komitmen-terhadap-keberlanjutan-dan-hilirisasi-mineral) | [MIND ID Digitalization](https://mind.id/en/news/wujud-transformasi-bumn-mind-id-lanjutkan-transformasi-dan-dorong-digitalisasi-industri-pertambangan)*
