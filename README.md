 Self-Healing River Robot — Web Simulation

An interactive, dataset-driven web simulation of an autonomous river-cleaning robot that navigates a 36 × 14 km river grid, scanning each cell for pollution using real sensor data and generating site-specific remediation plans.

Project by: Akkinapalli Idhika · AIE24201

 Table of Contents

Overview
Live Demo
Features
Project Structure
Getting Started
How It Works
Dataset
Tech Stack
Screenshots
License


 Overview
The Self-Healing River Robot simulates an autonomous environmental robot navigating a digitized river environment. The robot scans every grid cell using real water quality sensor data loaded from a CSV dataset, classifies the type and severity of pollution found, and produces a detailed, cell-specific remediation plan — including estimated cost, compliance timeline, and step-by-step treatment actions.
The project originated as a MATLAB-based robotics simulation and was rebuilt as a fully interactive browser application using HTML5 Canvas and Vanilla JavaScript — requiring no server, build tool, or external dependency to run.

 Live Demo
GitHub Pages deployment:
https://<YOUR_USERNAME>.github.io/RiverRobot
To enable GitHub Pages:

Push the repository to GitHub.
Go to Settings → Pages.
Set Source to main branch, root folder (/).
The site will be live within a few minutes.

 Features
FeatureDescription Live Canvas SimulationAnimated robot navigating the full 36 × 14 river grid using a boustrophedon (snake) path planner📊 Real CSV Dataset504 grid cells with real pH, dissolved oxygen, turbidity, and temperature readings🧪 7 Pollution TypesAgricultural Runoff, Industrial Discharge, Plastic Waste, Sewage & Pathogens, Oil Spill, Thermal Pollution, Mining Acid Drainage🚦 3 Severity LevelsLow (Caution), Medium (Serious), High (Critical)🖱️ Interactive Cell InspectionClick any grid cell to view its raw sensor readings and a full remediation plan⚡ Adjustable SpeedSlider control from Slow (200 ms/step) to Fast (20 ms/step)📡 Live Mission DashboardBattery gauge, coverage gauge, live sensor bars, Water Quality Index (WQI), and pollution breakdown chart🪨 Obstacle AvoidanceRock Outcrops × 3, Bridge Pylon × 1, Debris Jam × 1 hardcoded into the grid📱 Responsive DesignWorks on desktop and mobile browsers💊 Remediation PlansEach polluted cell gets a multi-step, sensor-value-aware clean-up plan with cost estimates

 Project Structure
RiverRobot/
│
├── index.html          # Main HTML page — navbar, simulation canvas, dataset preview, about section
├── style.css           # Dark sci-fi / tech theme with CSS variables, animations, responsive layout
├── script.js           # Core simulation engine: path planner, canvas renderer, dashboard, info panel
├── data.js             # CSV dataset embedded as a JavaScript constant (auto-generated from dataset.csv)
├── dataset.csv         # Original sensor dataset — 504 rows × 14 columns
└── README.md           # This file
Why data.js exists separately
The browser cannot load a local .csv file via fetch() when opening index.html directly from the file system (CORS restriction). data.js pre-embeds the parsed CSV as a JS array (CSV_DATA), so the simulation works with a simple double-click on index.html — no web server needed.

 Getting Started
Option 1 — Open locally (no server required)
bash# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/RiverRobot.git

# Navigate into the folder
cd RiverRobot

# Open directly in your browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
Option 2 — Serve with a local dev server (optional)
bash# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
Then open http://localhost:8000 in your browser.
Option 3 — GitHub Pages (recommended for sharing)
See the Live Demo section above.

⚙️ How It Works
1. Grid Construction
On page load, script.js reads the CSV_DATA array from data.js and populates two 14 × 36 matrices:

grid — stores pollution level (0–3) and pollution type for each cell.
sensorGrid — stores the four raw sensor readings (pH, DO, turbidity, temperature) per cell.

2. Path Planning
The robot follows a boustrophedon (lawnmower / snake) path — traversing row 0 left-to-right, row 1 right-to-left, and so on. Cells marked as obstacles are skipped automatically.
3. Canvas Rendering
Each simulation step:

Draws the water background gradient.
Colours each cell by pollution severity (colour-coded: blue = clean, green = low, orange = medium, red = high, purple = obstacle).
Renders a fading trail behind the robot.
Draws the robot as a glowing cyan circle with a scan beam.

4. Dashboard Updates
Every 6 steps, the Mission Control panel refreshes:

Pollution breakdown bar chart (count of clean/low/medium/high cells).
Sensor readings for the robot's current cell with colour-coded status flags.
Water Quality Index (WQI) — percentage of the four parameters within ideal ranges.
Battery and coverage semi-circular gauges.

5. Cell Inspection (Click-to-Inspect)
Clicking any canvas cell opens a pop-up panel showing:

Raw sensor values from the CSV with status labels (Normal / Low / Elevated / etc.).
Estimated remediation cost and compliance timeline.
A type × severity specific remediation plan (7 pollution types × 3 severity levels = 21 distinct plan templates), each incorporating the cell's actual sensor readings into the action steps.

6. Obstacles
Five fixed obstacles are placed in the grid (rock outcrops, a bridge pylon, and a debris jam). The path planner skips these cells; they are rendered in purple with a label.

Dataset
File: dataset.csv / data.js
Rows: 504 (14 rows × 36 columns)
Source: Synthetic sensor data generated for MATLAB robotics simulation
ColumnDescriptionIdeal RangeRowGrid row position (1–14)—ColGrid column position (1–36)—Pollution_LevelSeverity code: 0 = Clean, 1 = Low, 2 = Medium, 3 = High—Pollution_Type_IDNumeric type code (0–7)—Pollution_TypeType name (e.g., Agricultural_Runoff)—SeverityLabel (Clean / Low_Caution / Medium_Serious / High_Critical)—pHWater acidity / alkalinity6.5 – 8.5pH_StatusNormal / Acidic / Alkaline—DO_mgLDissolved oxygen (mg/L)> 6 mg/LDO_StatusGood / Low / Hypoxic—Turbidity_NTUWater clarity (NTU)< 25 NTUTurbidity_StatusNormal / Elevated / Very High—Temperature_CWater temperature (°C)8 – 20 °CTemp_StatusNormal / Too Warm / Cold—
Pollution Type Distribution
IDTypeCharacteristic Signature1Agricultural RunoffHigh pH (8.1–8.4), elevated turbidity2Industrial DischargeLow pH (3.4–5.1), very high turbidity, low DO3Plastic / Solid WasteNear-normal chemistry, elevated turbidity4Sewage & PathogensLow pH (4.8–6.7), very low DO, high turbidity5Oil / Hydrocarbon SpillNear-normal pH, reduced DO, low turbidity6Thermal PollutionNormal pH/turbidity, elevated temperature, reduced DO7Mining Acid DrainageVery low pH (3.0–5.0), high turbidity

Tech Stack
TechnologyRoleHTML5 CanvasGrid rendering and robot animationVanilla JavaScript (ES6)Simulation engine, path planner, dashboard logicCSS3Dark sci-fi theme, CSS variables, keyframe animations, responsive layoutGoogle FontsShare Tech Mono (monospace UI), Exo 2 (body text)MATLAB (original)Source simulation used to design the grid logic and datasetCSVRaw sensor data (504 cells × 14 columns)
No frameworks, no bundlers, no dependencies. Everything runs from static files.

 Remediation Plan Logic
The getRemediationSteps(pollutionType, severityLevel, sensorReadings) function in script.js maps each of the 21 type × severity combinations to a specific, multi-step treatment plan. Each step references the cell's actual sensor values (e.g., "DO = 1.2 mg/L — deploy aerators IMMEDIATELY"), making every plan contextually accurate rather than generic.
Remediation plans include:

Immediate containment actions
Chemical or biological treatment methods
Compliance monitoring timelines
Estimated cost (computed from severity level and pollution type)
Emergency escalation steps for High (Critical) severity cells

 License
© 2025 Akkinapalli Idhika · Environmental Robotics · AIE24201
This project was built for academic and demonstration purposes. Feel free to fork, adapt, and build upon it with attribution.

Built with HTML5 Canvas · Vanilla JS · CSS3 · Real Sensor Data
