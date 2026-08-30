# GET ALONG 🏍️

> **Motorcycle Group Rides Platform**  
> Unified repository housing **v1 (Legacy Hardened)** and **v2 (Simplified & Elevated Experience)**.

---

## 📁 Repository Structure

```
GetAlong/
├── v1/                # Legacy full-stack version (React 19 + Express + PostgreSQL + JWT)
├── v2/                # Simplified & Elevated v2 version (1-Tap Join, Quick Templates, Chat Chips)
├── .gitignore
└── README.md
```

---

## 🚀 Version Overview

### 🔹 [`v1/`](./v1) — Legacy Hardened Baseline
- **Stack**: React 19, Vite 6, Express 4, PostgreSQL, JWT Authentication, bcryptjs.
- **Features**: Group ride feed, Waypoints map, Participant list, Group chat, Post-ride star reviews, Rider profile & Garage, Emergency SOS contacts.
- **Documentation**: See [`v1/docs/gen_ai_advisor_review.md`](./v1/docs/gen_ai_advisor_review.md) and [`v1/docs/data_model.md`](./v1/docs/data_model.md).

---

### 🌟 [`v2/`](./v2) — Simplified & Elevated UX (Next Gen)
- **Key Innovations**:
  1. **30-Second Ride Creation**: Quick presets (*Breakfast Run*, *Ghats & Twisties*, *Coastal Sunset Cruise*) with auto-calculated distance & time.
  2. **1-Tap Quick-Join Sheet**: Instant registration confirming primary bike from garage & emergency contact readiness.
  3. **Hands-Free Chat Chips**: Pre-set status updates (`📍 Arrived`, `⛽ Fueling up`, `☕ Reached stop`) for quick messaging on ride morning.
  4. **Hero Ride-Day Banner**: Dynamic rollout countdown timer rendered on feed on ride morning.
  5. **Progressive Disclosure Cards**: High readability timeline layout with clean dark mode HSL design.

---

## 🛠️ Quick Start

### Running `v1`:
```bash
cd v1
npm install
npm run dev:all
```

### Running `v2`:
```bash
cd v2
npm install
npm run dev:all
```
