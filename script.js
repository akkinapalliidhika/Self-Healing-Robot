// ============================================================
//  RIVER ROBOT — Simulation Engine
//  Akkinapalli Idhika · AIE24201
// ============================================================

const W = 14, L = 36; // rows × cols

// ── Build grid from CSV ──
const grid = Array.from({length: W}, () => Array(L).fill(null));
const sensorGrid = Array.from({length: W}, () => Array(L).fill(null));

CSV_DATA.forEach(d => {
  const r = d.r - 1, c = d.c - 1;
  if (r >= 0 && r < W && c >= 0 && c < L) {
    grid[r][c] = { lv: d.lv, pt: d.pt, type: d.type };
    sensorGrid[r][c] = { pH: d.pH, DO: d.DO, TU: d.TU, TM: d.TM };
  }
});

// Fill missing cells with clean
for (let r = 0; r < W; r++)
  for (let c = 0; c < L; c++)
    if (!grid[r][c]) grid[r][c] = { lv: 0, pt: 0, type: 'Clean' };

// ── Obstacles ──
const OBSTACLES = [[3,8],[9,8],[6,19],[2,27],[10,32]];
const OBS_LABELS = ['Rock','Rock','Bridge','Debris','Rock'];
const obsSet = new Set(OBSTACLES.map(([r,c]) => `${r},${c}`));

// ── Colors ──
const CELL_COLORS = ['#1a4a6e','#2a7a1e','#b85000','#8b0000'];
const CELL_GLOW   = ['rgba(91,200,245,0.8)','rgba(76,206,48,0.8)','rgba(255,152,0,0.8)','rgba(255,45,45,0.8)'];
const TYPE_NAMES  = ['—','Agricultural Runoff','Industrial Discharge','Plastic/Solid Waste','Sewage & Pathogens','Oil/Hydrocarbon Spill','Thermal Pollution','Mining Acid Drainage'];

// ── Canvas setup ──
const canvas = document.getElementById('riverCanvas');
const ctx    = canvas.getContext('2d');

function cellW() { return canvas.width / L; }
function cellH() { return canvas.height / W; }

function drawGrid(robotPos, trail) {
  const cw = cellW(), ch = cellH();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Water bg
  const bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
  bg.addColorStop(0, '#030e1e');
  bg.addColorStop(1, '#0a2040');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines
  ctx.strokeStyle = 'rgba(0,198,255,0.07)';
  ctx.lineWidth = 0.5;
  for (let c = 0; c <= L; c++) {
    ctx.beginPath(); ctx.moveTo(c*cw, 0); ctx.lineTo(c*cw, canvas.height); ctx.stroke();
  }
  for (let r = 0; r <= W; r++) {
    ctx.beginPath(); ctx.moveTo(0, r*ch); ctx.lineTo(canvas.width, r*ch); ctx.stroke();
  }

  // Cells
  for (let r = 0; r < W; r++) {
    for (let c = 0; c < L; c++) {
      const key = `${r},${c}`;
      const lv = grid[r][c].lv;
      const x = c * cw, y = r * ch;

      if (obsSet.has(key)) {
        // Obstacle
        ctx.fillStyle = 'rgba(80,10,120,0.85)';
        ctx.fillRect(x+1, y+1, cw-2, ch-2);
        ctx.strokeStyle = 'rgba(156,39,176,0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x+1, y+1, cw-2, ch-2);
      } else if (lv > 0) {
        ctx.fillStyle = CELL_COLORS[lv] + 'cc';
        ctx.fillRect(x+1, y+1, cw-2, ch-2);
      }
    }
  }

  // Trail
  if (trail && trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(trail[0][1]*cw + cw/2, trail[0][0]*ch + ch/2);
    for (let i = 1; i < trail.length; i++)
      ctx.lineTo(trail[i][1]*cw + cw/2, trail[i][0]*ch + ch/2);
    ctx.strokeStyle = 'rgba(0,198,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3,3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Obstacles labels
  OBSTACLES.forEach(([r,c], i) => {
    const x = c*cw, y = r*ch;
    ctx.fillStyle = 'rgba(156,39,176,0.9)';
    ctx.font = `bold ${Math.max(6, cw*0.4)}px Share Tech Mono`;
    ctx.textAlign = 'center';
    ctx.fillText(OBS_LABELS[i], x + cw/2, y + ch/2 + 3);
  });

  // Robot
  if (robotPos) {
    const [rr, rc] = robotPos;
    const rx = rc * cw + cw/2, ry = rr * ch + ch/2;

    // Glow
    const grd = ctx.createRadialGradient(rx, ry, 0, rx, ry, cw*1.5);
    grd.addColorStop(0, 'rgba(0,198,255,0.35)');
    grd.addColorStop(1, 'rgba(0,198,255,0)');
    ctx.beginPath(); ctx.arc(rx, ry, cw*1.5, 0, Math.PI*2);
    ctx.fillStyle = grd; ctx.fill();

    // Robot circle
    ctx.beginPath(); ctx.arc(rx, ry, Math.min(cw, ch)*0.38, 0, Math.PI*2);
    ctx.fillStyle = '#00c6ff'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();

    // Scan beam
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(Math.min(canvas.width, rx + cw * 3), ry);
    ctx.strokeStyle = 'rgba(0,230,118,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ── Path planner (boustrophedon) ──
function planPath() {
  const path = [];
  let c = 0, dir = 1;
  for (let r = 0; r < W; r++) {
    const cols = dir === 1 ? range(0, L) : range(L-1, -1, -1);
    for (const col of cols) {
      if (!obsSet.has(`${r},${col}`)) path.push([r, col]);
    }
    dir *= -1;
  }
  return path;
}

function range(start, end, step = 1) {
  const r = [];
  if (step > 0) for (let i = start; i < end; i += step) r.push(i);
  else for (let i = start; i > end; i += step) r.push(i);
  return r;
}

// ── Dashboard update ──
function updateDashboard(step, totalSteps, battery, rr, rc) {
  let n0=0, n1=0, n2=0, n3=0;
  for (let r = 0; r < W; r++)
    for (let c = 0; c < L; c++) {
      const lv = grid[r][c].lv;
      if (lv===0) n0++; else if (lv===1) n1++;
      else if (lv===2) n2++; else if (lv===3) n3++;
    }
  const total = W * L;
  document.getElementById('v0').textContent = n0;
  document.getElementById('v1').textContent = n1;
  document.getElementById('v2').textContent = n2;
  document.getElementById('v3').textContent = n3;
  document.getElementById('b0').style.height = (n0/total*100) + '%';
  document.getElementById('b1').style.height = (n1/total*100) + '%';
  document.getElementById('b2').style.height = (n2/total*100) + '%';
  document.getElementById('b3').style.height = (n3/total*100) + '%';

  // Sensors
  const s = (rr >= 0 && rr < W && rc >= 0 && rc < L && sensorGrid[rr][rc])
    ? sensorGrid[rr][rc]
    : { pH:7.4, DO:8.5, TU:4, TM:14 };

  document.getElementById('pH-val').textContent = s.pH.toFixed(2);
  document.getElementById('do-val').textContent = s.DO.toFixed(1);
  document.getElementById('tu-val').textContent = s.TU.toFixed(1);
  document.getElementById('tm-val').textContent = s.TM.toFixed(1);
  document.getElementById('pH-bar').style.width = ((s.pH - 3)/(14-3)*100) + '%';
  document.getElementById('do-bar').style.width = (s.DO/15*100) + '%';
  document.getElementById('tu-bar').style.width = Math.min(100, s.TU/200*100) + '%';
  document.getElementById('tm-bar').style.width = ((s.TM-0)/45*100) + '%';

  const pHok = s.pH >= 6.5 && s.pH <= 8.5;
  const DOok = s.DO >= 6;
  const TUok = s.TU <= 25;
  const TMok = s.TM <= 20;
  const health = (pHok + DOok + TUok + TMok) * 25;
  const wqiEl = document.getElementById('wqiVal');
  wqiEl.textContent = health + '%';
  wqiEl.style.color = health >= 75 ? 'var(--green)' : health >= 50 ? 'var(--orange)' : 'var(--red)';

  // Gauges
  const battPct = battery / 100;
  const covPct  = Math.min(1, step / totalSteps);
  const dashLen = 110;
  document.getElementById('battGauge').style.strokeDashoffset = dashLen * (1 - battPct);
  document.getElementById('battGauge').style.stroke = battery > 30 ? 'var(--green)' : 'var(--red)';
  document.getElementById('battVal').textContent = Math.round(battery) + '%';
  document.getElementById('covGauge').style.strokeDashoffset = dashLen * (1 - covPct);
  document.getElementById('covVal').textContent = Math.round(covPct * 100) + '%';
}

function updateStatusBar(step, totalSteps, battery, rr, rc, speed) {
  document.getElementById('sb-step').textContent    = `STEP: ${step}/${totalSteps}`;
  document.getElementById('sb-scan').textContent    = `SCAN: ${Math.round(step/totalSteps*100)}%`;
  document.getElementById('sb-battery').textContent = `BATTERY: ${Math.round(battery)}%`;
  document.getElementById('sb-pos').textContent     = `POS: (${rc+1},${rr+1})`;
  document.querySelectorAll('.pip').forEach((p, i) => {
    p.classList.toggle('active', i < speed);
  });
}

// ── Simulation state ──
let simRunning = false, simPaused = false, simTimer = null;
let path = [], step = 0, trail = [];

function resetSim() {
  simRunning = false; simPaused = false;
  clearTimeout(simTimer);
  path = planPath(); step = 0; trail = [];
  document.getElementById('completeOverlay').classList.add('hidden');
  document.getElementById('infoPanel').classList.add('hidden');
  drawGrid(null, []);
  updateDashboard(0, path.length, 100, -1, -1);
  updateStatusBar(0, path.length, 100, 0, 0, parseInt(document.getElementById('speedSlider').value));
  document.getElementById('btnStart').textContent = '▶ START';
  document.getElementById('btnStart').disabled = false;
}

function getDelay(speed) {
  return [200, 140, 90, 50, 20][speed - 1];
}

function runStep() {
  if (!simRunning || simPaused) return;
  if (step >= path.length) {
    simRunning = false;
    const n_polluted = CSV_DATA.filter(d => d.lv > 0).length;
    document.getElementById('completeSummary').textContent =
      `Scanned ${W*L} cells · ${n_polluted} polluted · ${path.length} steps completed · Season: Spring · Weather: Rain`;
    document.getElementById('completeOverlay').classList.remove('hidden');
    drawGrid(null, trail);
    return;
  }

  const [rr, rc] = path[step];
  trail.push([rr, rc]);
  if (trail.length > 80) trail.shift();
  const battery = Math.max(15, 100 - (step / path.length) * 85);
  const speed = parseInt(document.getElementById('speedSlider').value);

  drawGrid([rr, rc], trail);
  if (step % 6 === 0)
    updateDashboard(step, path.length, battery, rr, rc);
  updateStatusBar(step, path.length, battery, rr, rc, speed);
  step++;
  simTimer = setTimeout(runStep, getDelay(speed));
}

// ── Buttons ──
document.getElementById('btnStart').addEventListener('click', () => {
  if (!simRunning) {
    simRunning = true; simPaused = false;
    document.getElementById('completeOverlay').classList.add('hidden');
    document.getElementById('btnStart').textContent = '⏹ RUNNING';
    document.getElementById('btnStart').disabled = true;
    runStep();
  }
});

document.getElementById('btnPause').addEventListener('click', () => {
  if (simRunning) {
    simPaused = !simPaused;
    document.getElementById('btnPause').textContent = simPaused ? '▶ RESUME' : '⏸ PAUSE';
    if (!simPaused) runStep();
  }
});

document.getElementById('btnReset').addEventListener('click', resetSim);
document.getElementById('btnRestartComplete').addEventListener('click', resetSim);

document.getElementById('speedSlider').addEventListener('input', e => {
  document.getElementById('speedDisplay').textContent = e.target.value;
});

// ── Canvas click → info panel ──
canvas.addEventListener('click', e => {
  const rect  = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top)  * scaleY;
  const rc = Math.floor(x / cellW());
  const rr = Math.floor(y / cellH());
  if (rr < 0 || rr >= W || rc < 0 || rc >= L) return;
  showInfoPanel(rr, rc);
});

document.getElementById('infoClose').addEventListener('click', () => {
  document.getElementById('infoPanel').classList.add('hidden');
});

function showInfoPanel(rr, rc) {
  const cell   = grid[rr][rc];
  const sensor = sensorGrid[rr][rc] || { pH:7.4, DO:8.5, TU:4, TM:14 };
  const lv     = cell.lv;
  const pt     = cell.pt;

  const sevColors = ['#5bc8f5','#4cce30','#ff9800','#ff2d2d'];
  const sevLabels = ['CLEAN','LOW — CAUTION','MEDIUM — SERIOUS','HIGH — CRITICAL'];

  document.getElementById('infoPanel').classList.remove('hidden');
  document.getElementById('infoTitle').innerHTML =
    `Cell (${rc+1}, ${rr+1}) &nbsp;·&nbsp; <span style="color:${sevColors[lv]}">${sevLabels[lv]}</span>` +
    (pt > 0 ? ` &nbsp;·&nbsp; <span style="color:var(--muted);font-size:0.8rem">${TYPE_NAMES[pt]}</span>` : '');

  // Sensor table
  const pHs  = sensor.pH  < 6.5 ? 'ACIDIC'   : sensor.pH  > 8.5 ? 'ALKALINE' : 'Normal';
  const DOs  = sensor.DO  < 4   ? 'HYPOXIC'  : sensor.DO  < 6   ? 'Low'      : 'Good';
  const TUs  = sensor.TU  > 100 ? 'Very High': sensor.TU  > 25  ? 'Elevated' : 'Normal';
  const TMs  = sensor.TM  > 25  ? 'Too Warm' : sensor.TM  < 8   ? 'Cold'     : 'Normal';
  const cls  = v => v === 'Normal' || v === 'Good' ? 'status-ok' : v === 'Low' || v === 'Elevated' || v === 'Cold' || v === 'Too Warm' ? 'status-warn' : 'status-bad';

  document.getElementById('infoSensors').innerHTML = `
    <h4>Sensor Readings (CSV Data)</h4>
    <table>
      <tr><td>pH</td><td>${sensor.pH.toFixed(2)}</td><td class="${cls(pHs)}">${pHs}</td></tr>
      <tr><td>DO (mg/L)</td><td>${sensor.DO.toFixed(1)}</td><td class="${cls(DOs)}">${DOs}</td></tr>
      <tr><td>Turbidity (NTU)</td><td>${sensor.TU.toFixed(1)}</td><td class="${cls(TUs)}">${TUs}</td></tr>
      <tr><td>Temperature (°C)</td><td>${sensor.TM.toFixed(1)}</td><td class="${cls(TMs)}">${TMs}</td></tr>
      <tr><td>Risk Level</td><td colspan="2" class="${['status-ok','status-warn','status-warn','status-bad'][lv]}">${['None','Low','Moderate','High — Act Now'][lv]}</td></tr>
      ${pt > 0 ? `<tr><td>Est. Cost</td><td colspan="2">$${((lv*8000 + pt*1500)*0.01).toFixed(0)*100}</td></tr>` : ''}
      ${pt > 0 ? `<tr><td>Timeline</td><td colspan="2">${[0,2,7,21][lv]} days to compliance</td></tr>` : ''}
    </table>`;

  // Remediation
  const steps = getRemediationSteps(pt, lv, sensor);
  const stepsHtml = lv === 0
    ? '<p style="color:var(--green)">✅ Clean — No action required. Routine monitoring in 7 days.</p>'
    : `<div class="remediation-steps">${steps.map((s,i) => `<div class="step">${i+1}. ${s}</div>`).join('')}</div>`;

  document.getElementById('infoRemediation').innerHTML = `<h4>Remediation Plan</h4>${stepsHtml}`;
  document.getElementById('infoPanel').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function getRemediationSteps(pt, lv, s) {
  if (lv === 0) return [];
  const plans = {
    1: {
      1: ['Deploy silt-fence barriers at field boundaries.',
          'Establish 10m grass buffer strip along riverbank.',
          'Apply slow-release biochar to reduce leaching.',
          `Turbidity ${s.TU.toFixed(1)} NTU — install sediment trap.`,
          'Monitor nitrate weekly — target < 50 mg/L.'],
      2: ['Issue Stop Notice to farm operator (24 hrs).',
          'Install inflatable dam to contain nutrient plume.',
          'Deploy floating constructed wetland (water hyacinth).',
          `DO=${s.DO.toFixed(1)} mg/L — deploy aerators IMMEDIATELY.`,
          'Add alum 5 mg/L to precipitate phosphorus.',
          'Full nutrient audit. Re-scan 72 hours.'],
      3: ['EMERGENCY — Eutrophication collapse risk!',
          'Notify Environmental Protection Authority.',
          'Emergency shutdown of upstream irrigation.',
          `DO=${s.DO.toFixed(1)}, pH=${s.pH.toFixed(1)} — aerators on max.`,
          'Apply iron sulfate to crash algal bloom.',
          'Phytoremediation with vetiver grass.'],
    },
    2: {
      1: ['Take water samples — ICP-MS metal panel.',
          'Add activated carbon filter to outfall pipe.',
          `pH=${s.pH.toFixed(2)} — dose lime if pH < 6.5.`,
          'Monitor Pb, Cd, Zn, Cr every 24 hours.'],
      2: ['SEAL discharge pipe — contact site manager.',
          'Hard inflatable dam — contain plume.',
          `pH=${s.pH.toFixed(2)} — inject lime slurry to >6.5.`,
          'Ion-exchange resin columns in-line.',
          'Independent audit. Re-scan 72 hours.'],
      3: ['EMERGENCY — Industrial spill. Notify regulator.',
          'Evacuate public from 500m riverbank zone.',
          'Hard containment boom + hazmat sorbent pads.',
          `pH=${s.pH.toFixed(2)}, DO=${s.DO.toFixed(1)} — mortality risk.`,
          'Vacuum truck — liquid waste to licensed site.',
          'Groundwater monitoring. Re-scan 7 days.'],
    },
    3: {
      1: ['Manual litter collection — nets, tongs.',
          'Install floating trash screen (mesh < 5mm).',
          'Deploy passive microplastic collector buoy.',
          `Turbidity ${s.TU.toFixed(1)} NTU — check for microplastics.`],
      2: ['Deploy WasteShark autonomous skimmer.',
          'Install Seabin floating collector.',
          'Fine-mesh trawl for microplastic load.',
          'Coagulation-flocculation for micro-fragments.',
          'Source trace — CCTV upstream access audit.'],
      3: ['EMERGENCY — major illegal dumping event.',
          'Alert waste authority — criminal enforcement.',
          'Full skimmer fleet + bank vacuum collection.',
          'ROV inspection for submerged debris.',
          'Legal action. Re-scan 7 days.'],
    },
    4: {
      1: ['E. coli + total coliform lab test (24 hrs).',
          'Inspect nearest combined sewer overflow (CSO).',
          `DO=${s.DO.toFixed(1)} — if <6, install aeration pump.`,
          'Apply slow-release chlorine tablet.'],
      2: ['CLOSE REACH — swimming/fishing ban enforced.',
          'Trace and seal CSO or broken sewer pipe.',
          'Chlorination — 1.0 mg/L free residual Cl2.',
          'UV-C disinfection unit (254 nm) in-line.',
          'Weekly pathogen testing. Re-scan 72 hrs.'],
      3: ['EMERGENCY — public health closure of reach.',
          'Notify Public Health Authority immediately.',
          'Plug all CSOs and sewer surcharge points.',
          'Deploy mobile MBBR treatment plant.',
          `DO=${s.DO.toFixed(1)}, Temp=${s.TM.toFixed(1)}°C — pathogen risk HIGH.`,
          'Shock chlorination 5 mg/L, 30 min contact.'],
    },
    5: {
      1: ['Deploy oil-absorbent boom at perimeter.',
          'Apply oleophilic sorbent pads to sheen.',
          'Introduce Alcanivorax bacteria culture.',
          `DO=${s.DO.toFixed(1)} — aeration aids biodegradation.`],
      2: ['Contain spill with inflatable boom ring.',
          'Skim oil — sealed drums, licensed haulier.',
          'Apply Corexit EC9500A dispersant.',
          'Bio-augmentation: oil-degrading microbes.',
          'TPH + BTEX weekly. Re-scan 72 hrs.'],
      3: ['EMERGENCY — Major oil spill. ICS protocol.',
          'Notify National Environmental Emergency.',
          'Full containment boom (double-layer).',
          'Vacuum recovery tanker — bulk oil removed.',
          '3-month bioremediation programme starts.'],
    },
    6: {
      1: [`Temp ${s.TM.toFixed(1)}°C — log vs ambient (target +3°C max).`,
          'Increase riparian tree cover for shading.',
          'Cross-ref temp spikes with plant discharge logs.'],
      2: [`Temp=${s.TM.toFixed(1)}°C — exceeds guideline. Issue notice.`,
          'Demand cooling tower audit in 5 working days.',
          `DO=${s.DO.toFixed(1)} — O2 drops at high temp. Add aerators.`,
          'Plant native alder + willow for shading.'],
      3: [`EMERGENCY — Temp=${s.TM.toFixed(1)}°C. Threshold exceeded.`,
          'Issue emergency cease-discharge order.',
          'Deploy floating insulating shade screens.',
          `DO=${s.DO.toFixed(1)} — fish kill imminent. Aerators NOW.`,
          'Regulatory enforcement + licence suspension.'],
    },
    7: {
      1: [`pH=${s.pH.toFixed(2)} — add limestone gravel to bed.`,
          'Revegetate spoil heap with acid-tolerant grass.',
          'Test Fe, Mn, Al, As vs EPA limits.',
          'Install passive limestone drain at seep.'],
      2: [`pH=${s.pH.toFixed(2)} — dose crushed limestone 50 kg/m3.`,
          'Install anoxic limestone drain (ALD).',
          'Construct Sphagnum moss wetland for metals.',
          'Full metal panel: Fe,Mn,Al,As,Pb,Zn,Cu,Ni,SO4.'],
      3: [`EMERGENCY — pH=${s.pH.toFixed(2)}. Extreme acidity!`,
          'Deploy rapid lime-dosing pump at source.',
          'Install active HDS treatment plant.',
          `DO=${s.DO.toFixed(1)} — acidic anoxia. Emergency oxygenation.`,
          'Ferric hydroxide precipitation + licensed disposal.',
          'Mining authority emergency inspection.'],
    },
  };
  return (plans[pt] && plans[pt][lv]) || ['Conduct general water quality survey.'];
}

// ── Dataset table ──
function buildDataTable() {
  const tbody = document.getElementById('dataTableBody');
  const rows = CSV_DATA.slice(0, 20);
  const sevColors = {
    'Low_Caution':'var(--green)','Medium_Serious':'var(--orange)','High_Critical':'var(--red)',
    'Clean':'var(--muted)'
  };
  tbody.innerHTML = rows.map(d => `
    <tr>
      <td>${d.r}</td>
      <td>${d.c}</td>
      <td class="level-${d.lv}">${d.lv}</td>
      <td style="color:${sevColors[d.sev]||'var(--text)'};">${(d.type||'').replace(/_/g,' ')}</td>
      <td style="color:${sevColors[d.sev]||'var(--text)'};">${(d.sev||'').replace(/_/g,' ')}</td>
      <td>${d.pH.toFixed(2)}</td>
      <td>${d.DO.toFixed(1)}</td>
      <td>${d.TU.toFixed(1)}</td>
      <td>${d.TM.toFixed(1)}</td>
    </tr>`).join('');
}

// ── Navbar scroll ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// ── Init ──
resetSim();
buildDataTable();
updateDashboard(0, planPath().length, 100, -1, -1);
