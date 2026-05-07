#  Self-Healing River Robot — Web Simulation

An interactive web-based simulation of an autonomous river-cleaning robot that navigates a **36×14 km river grid**, scanning each cell for pollution using real sensor data from a CSV dataset and generating site-specific remediation plans.

> **Project by: Akkinapalli Idhika · AIE24201**

---

## Features

- **Live Canvas Simulation** — animated robot navigating the full river grid
- **Real CSV Dataset** — 504 cells of real pH, DO, turbidity, and temperature readings
- **7 Pollution Types** — Agricultural, Industrial, Plastic, Sewage, Oil, Thermal, Mining
- **3 Severity Levels** — Low (Caution), Medium (Serious), High (Critical)
- **Click any cell** — view sensor readings + full remediation plan
- **Adjustable robot speed** — slider from Slow to Fast
- **Live dashboard** — battery gauge, coverage gauge, sensor bars, WQI
- **Obstacle avoidance** — Rock outcrops, Bridge pylon, Debris jam
- **Responsive design** — works on desktop and mobile

##  Project Structure

```
RiverRobot/
├── index.html      # Main page
├── style.css       # Dark sci-fi theme
├── script.js       # Simulation engine + canvas rendering
├── data.js         # CSV data embedded as JS (auto-generated)
├── dataset.csv     # Original sensor dataset (504 rows)
└── README.md
```

##  Run Locally

Just open `index.html` in any modern browser — no server or build step required.

## GitHub Pages

1. Push to GitHub
2. Settings → Pages → Source: `main` / root
3. Live at `https://YOUR_USERNAME.github.io/RiverRobot`

## Tech Stack

- **MATLAB** (original simulation)
- **HTML5 Canvas** (robot animation)
- **Vanilla JS** (simulation engine, path planner)
- **CSS3** (dark sci-fi theme, animations)
- **CSV Dataset** (real sensor data, 504 cells)

## Dataset

`all_pollution_types_dataset.csv` — 504 rows × 14 columns:

| Column | Description |
|--------|-------------|
| Row, Col | Grid position |
| Pollution_Level | 0–3 (Clean to Critical) |
| Pollution_Type | Agricultural, Industrial, etc. |
| pH | Water acidity (ideal: 6.5–8.5) |
| DO_mgL | Dissolved oxygen (ideal: >6) |
| Turbidity_NTU | Water clarity (ideal: <25) |
| Temperature_C | Water temperature (ideal: 8–20) |

© 2025 Akkinapalli Idhika · Environmental Robotics
