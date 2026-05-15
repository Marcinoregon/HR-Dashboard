/* ═══════════════════════════════════════════════
   EMPLOYEE EXERCISE DASHBOARD — JS
   ═══════════════════════════════════════════════ */

/* ── CHART.JS DEFAULTS ── */
Chart.defaults.color = '#8892b0';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.plugins.tooltip.backgroundColor = '#1e2130';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.12)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.titleColor = '#f0f2ff';
Chart.defaults.plugins.tooltip.bodyColor = '#8892b0';
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';
Chart.defaults.scale.border.color = 'rgba(255,255,255,0.07)';
Chart.defaults.scale.ticks.color = '#4a5170';

/* ── PALETTE ── */
const PALETTE = [
  '#4f8ef7','#f472b6','#22d3a0','#fb923c','#a78bfa',
  '#2dd4bf','#facc15','#f87171','#60a5fa','#34d399',
  '#c084fc','#fb7185','#38bdf8','#4ade80','#fbbf24'
];

const WAGE_YEARS = ['Wage2020','Wage2021','Wage2022','Wage2023','Wage2024','Wage2025','Wage2026'];
const YEAR_LABELS = ['2020','2021','2022','2023','2024','2025','2026'];
const DIM_LABEL = {
  Gender: 'Gender', Race: 'Race', StoreMarket: 'Store Market',
  ExemptStatus: 'Exempt Status', JobTitle: 'Job Title'
};

/* ── GLOBAL STATE ── */
let filteredData = [];
let cmpChartType = 'line';
let charts = {};

/* ── HELPERS ── */
const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
const med = arr => { if(!arr.length) return 0; const s=[...arr].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; };
const fmt$ = v => v >= 1000 ? '$'+Math.round(v).toLocaleString() : '$'+v.toFixed(2);
const fmtN = v => v.toLocaleString();
const wageKey = yr => 'Wage'+yr;

function getField(emp, dim) {
  const map = { Gender:'Gender', Race:'Race', StoreMarket:'StoreMarket', ExemptStatus:'ExemptStatus', JobTitle:'JobTitle' };
  return emp[map[dim]];
}

function uniqueVals(dim) {
  return [...new Set(filteredData.map(e=>getField(e,dim)).filter(Boolean))].sort();
}

function getWage(emp, key) {
  const v = parseFloat(emp[key]);
  return isNaN(v) ? null : v;
}

function groupAvgWage(group, key) {
  const vals = group.map(e=>getWage(e,key)).filter(v=>v!==null);
  return avg(vals);
}

function destroyChart(id) {
  if(charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function yearsFromSpan(span) {
  const [s,e] = span.split('-').map(Number);
  return YEAR_LABELS.filter(y => +y >= s && +y <= e);
}

/* ── POPULATE JOB TITLE CHIPS ── */
function populateJobSelect() {
  const jobs = [...new Set(EMPLOYEE_DATA.map(e => e.JobTitle).filter(Boolean))].sort();
  const container = document.getElementById('fc-JobTitle');
  container.innerHTML = '';
  jobs.forEach(j => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip';
    btn.dataset.dim = 'JobTitle';
    btn.dataset.val = j;
    btn.textContent = j;
    btn.onclick = () => toggleFilterChip(btn);
    container.appendChild(btn);
  });
}

/* ── FILTER STATE (chip-based) ── */
const filterState = {
  Gender:       new Set(),
  Race:         new Set(),
  StoreMarket:  new Set(),
  ExemptStatus: new Set(),
  JobTitle:     new Set()
};

function toggleFilterChip(btn) {
  const dim = btn.dataset.dim;
  const val = btn.dataset.val;
  if (filterState[dim].has(val)) {
    filterState[dim].delete(val);
    btn.classList.remove('active');
  } else {
    filterState[dim].add(val);
    btn.classList.add('active');
  }
  updateFilterActiveCount();
  applyFilters();
}

function updateFilterActiveCount() {
  const total = Object.values(filterState).reduce((sum, s) => sum + s.size, 0);
  const el = document.getElementById('filter-active-count');
  if (total > 0) {
    el.textContent = total + ' filter' + (total > 1 ? 's' : '') + ' active';
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

/* ── FILTERS ── */
function applyFilters() {
  filteredData = EMPLOYEE_DATA.filter(e => {
    if (filterState.Gender.size       && !filterState.Gender.has(e.Gender))           return false;
    if (filterState.Race.size         && !filterState.Race.has(e.Race))               return false;
    if (filterState.StoreMarket.size  && !filterState.StoreMarket.has(e.StoreMarket)) return false;
    if (filterState.ExemptStatus.size && !filterState.ExemptStatus.has(e.ExemptStatus)) return false;
    if (filterState.JobTitle.size     && !filterState.JobTitle.has(e.JobTitle))       return false;
    return true;
  });
  updateKPIs();
  renderAll();
  document.getElementById('total-count').textContent = fmtN(filteredData.length);
}

function resetFilters() {
  Object.keys(filterState).forEach(dim => filterState[dim].clear());
  document.querySelectorAll('.filter-chip.active').forEach(b => b.classList.remove('active'));
  updateFilterActiveCount();
  applyFilters();
}

/* ── KPIs ── */
function updateKPIs() {
  const n = filteredData.length;
  document.getElementById('kv-n').textContent = fmtN(n);

  const wages26 = filteredData.map(e=>getWage(e,'Wage2026')).filter(v=>v!==null);
  document.getElementById('kv-wage').textContent = wages26.length ? fmt$(avg(wages26)) : '–';

  const ages = filteredData.map(e=>parseFloat(e.Age)).filter(v=>!isNaN(v));
  document.getElementById('kv-age').textContent = ages.length ? avg(ages).toFixed(1) : '–';

  // 6-year wage growth
  const growths = filteredData
    .map(e=>{ const w0=getWage(e,'Wage2020'); const w6=getWage(e,'Wage2026'); return (w0&&w6) ? (w6-w0)/w0*100 : null; })
    .filter(v=>v!==null);
  document.getElementById('kv-growth').textContent = growths.length ? '+'+avg(growths).toFixed(1)+'%' : '–';

  const exemptN = filteredData.filter(e=>e.ExemptStatus==='Exempt').length;
  document.getElementById('kv-exempt').textContent = n ? (exemptN/n*100).toFixed(1)+'%' : '–';
}

/* ── COMPARE CHART — chip-based group selection ── */
let cmpValA = null;
let cmpValB = null;

function onSplitDimChange() {
  const dim = document.getElementById('cmp-split-dim').value;
  const vals = [...new Set(EMPLOYEE_DATA.map(e => getField(e, dim)).filter(Boolean))].sort();
  cmpValA = vals[0] || null;
  cmpValB = vals[1] || null;
  renderChips();
  renderComparison();
}

function renderChips() {
  const dim  = document.getElementById('cmp-split-dim').value;
  const vals = [...new Set(EMPLOYEE_DATA.map(e => getField(e, dim)).filter(Boolean))].sort();
  const container = document.getElementById('cmp-val-chips');
  container.innerHTML = '';
  vals.forEach(v => {
    const btn = document.createElement('button');
    btn.className = 'val-chip';
    btn.dataset.value = v;
    const label = document.createElement('span');
    label.className = 'chip-label';
    if (v === cmpValA) {
      btn.classList.add('chip-a');
      label.textContent = 'A';
      btn.appendChild(label);
    } else if (v === cmpValB) {
      btn.classList.add('chip-b');
      label.textContent = 'B';
      btn.appendChild(label);
    }
    btn.appendChild(document.createTextNode(v));
    btn.addEventListener('click', () => onChipClick(v));
    container.appendChild(btn);
  });
}

function onChipClick(val) {
  if (val === cmpValA) {
    // clicking A → push A to B, clear A
    cmpValA = cmpValB;
    cmpValB = val;
  } else if (val === cmpValB) {
    // clicking B → clear B
    cmpValB = null;
  } else {
    // clicking neutral → becomes A, old A → B (old B dropped)
    cmpValB = cmpValA;
    cmpValA = val;
  }
  renderChips();
  renderComparison();
}

function setCmpChartType(type, btn) {
  cmpChartType = type;
  document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderComparison();
}

function renderComparison() {
  const dim    = document.getElementById('cmp-split-dim').value;
  const metric = document.getElementById('cmp-metric').value;
  const span   = document.getElementById('cmp-timespan').value;
  const years  = yearsFromSpan(span);

  if (!cmpValA && !cmpValB) {
    document.getElementById('compare-summary').innerHTML = '<span style="color:#4a5170;font-size:0.82rem">Select at least one group above.</span>';
    destroyChart('compare-chart'); return;
  }

  const groupA = cmpValA ? filteredData.filter(e => getField(e, dim) === cmpValA) : [];
  const groupB = cmpValB ? filteredData.filter(e => getField(e, dim) === cmpValB) : [];

  const labelA = cmpValA ? `${cmpValA} (n=${fmtN(groupA.length)})` : null;
  const labelB = cmpValB ? `${cmpValB} (n=${fmtN(groupB.length)})` : null;

  function calcData(group) {
    if (!group.length) return years.map(() => null);
    if (metric === 'wage') {
      return years.map(y => { const v = groupAvgWage(group, wageKey(y)); return v ? +v.toFixed(2) : null; });
    } else if (metric === 'age') {
      const ages = group.map(e => parseFloat(e.Age)).filter(v => !isNaN(v));
      return years.map(() => +avg(ages).toFixed(1));
    } else if (metric === 'count') {
      return years.map(() => group.length);
    } else if (metric === 'wageGrowth') {
      const firstY = years[0];
      return years.map(y => {
        const base = groupAvgWage(group, wageKey(firstY));
        const curr = groupAvgWage(group, wageKey(y));
        return base ? +((curr - base) / base * 100).toFixed(2) : null;
      });
    }
  }

  const dataA = calcData(groupA);
  const dataB = calcData(groupB);

  const valFmt = v => metric === 'wage' ? fmt$(v) : metric === 'wageGrowth' ? v.toFixed(2) + '%' : metric === 'age' ? v.toFixed(1) + ' yrs' : fmtN(v);
  const lastA  = dataA[dataA.length - 1];
  const lastB  = dataB[dataB.length - 1];
  const diff   = (lastA != null && lastB != null) ? lastA - lastB : null;

  document.getElementById('compare-summary').innerHTML = `
    ${cmpValA ? `<div class="summary-badge summary-badge--a"><span class="badge-label">A — ${cmpValA}</span> ${lastA != null ? valFmt(lastA) : '–'}</div>` : ''}
    ${cmpValB ? `<div class="summary-badge summary-badge--b"><span class="badge-label">B — ${cmpValB}</span> ${lastB != null ? valFmt(lastB) : '–'}</div>` : ''}
    ${diff != null ? `<div class="summary-badge summary-badge--diff"><span class="badge-label">Δ Difference</span> ${diff >= 0 ? '+' : ''}${valFmt(diff)}</div>` : ''}
  `;

  const isArea = cmpChartType === 'area';
  const chartType = (cmpChartType === 'bar') ? 'bar' : 'line';
  const yLabel = { wage: 'Average Wage ($)', age: 'Average Age', count: '# Employees', wageGrowth: 'Growth vs Start Year (%)' }[metric];

  const datasets = [];
  if (cmpValA) datasets.push({
    label: labelA, data: dataA,
    borderColor: '#4f8ef7',
    backgroundColor: isArea ? 'rgba(79,142,247,0.15)' : (chartType === 'bar' ? 'rgba(79,142,247,0.75)' : '#4f8ef7'),
    borderWidth: chartType === 'line' ? 2.5 : 0,
    pointBackgroundColor: '#4f8ef7', pointRadius: 5, pointHoverRadius: 7,
    fill: isArea ? 'origin' : false, tension: 0.4
  });
  if (cmpValB) datasets.push({
    label: labelB, data: dataB,
    borderColor: '#f472b6',
    backgroundColor: isArea ? 'rgba(244,114,182,0.15)' : (chartType === 'bar' ? 'rgba(244,114,182,0.75)' : '#f472b6'),
    borderWidth: chartType === 'line' ? 2.5 : 0,
    pointBackgroundColor: '#f472b6', pointRadius: 5, pointHoverRadius: 7,
    fill: isArea ? 'origin' : false, tension: 0.4
  });

  destroyChart('compare-chart');
  const ctx = document.getElementById('compare-chart').getContext('2d');
  charts['compare-chart'] = new Chart(ctx, {
    type: chartType,
    data: { labels: years, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: '#8892b0', boxWidth: 14, padding: 20, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              if (v == null) return ctx.dataset.label + ': –';
              return ctx.dataset.label + ': ' + (metric === 'wage' ? fmt$(v) : metric === 'wageGrowth' ? v.toFixed(2) + '%' : metric === 'age' ? v.toFixed(1) + ' yrs' : fmtN(v));
            }
          }
        }
      },
      scales: {
        x: { ticks: { color: '#4a5170' } },
        y: {
          title: { display: true, text: yLabel, color: '#4a5170', font: { size: 11 } },
          ticks: { callback: v => metric === 'wage' ? '$' + Math.round(v).toLocaleString() : metric === 'wageGrowth' ? v + '%' : v }
        }
      }
    }
  });
}

/* ── WAGE DISTRIBUTION ── */
function renderDistribution() {
  const yearKey = document.getElementById('dist-year').value;
  const groupDim = document.getElementById('dist-group').value;

  const allWages = filteredData.map(e=>getWage(e,yearKey)).filter(v=>v!==null);
  if(!allWages.length) return;

  // Build bins based on wage range
  const isHourly = e => getWage(e,yearKey) && getWage(e,yearKey) < 200;
  const hourlyWorkers = filteredData.filter(isHourly);
  const salaryWorkers = filteredData.filter(e=>!isHourly(e));

  // Two separate scales: hourly (<$50/hr) and salary (>$1000 annual)
  // Let's just bin all together, log-like buckets
  const bins = [
    {label:'< $10', min:0,    max:10},
    {label:'$10-12',min:10,   max:12},
    {label:'$12-15',min:12,   max:15},
    {label:'$15-18',min:15,   max:18},
    {label:'$18-22',min:18,   max:22},
    {label:'$22-30',min:22,   max:30},
    {label:'$30-50',min:30,   max:50},
    {label:'$50K+', min:1000, max:Infinity, isSalary:true},
  ];
  // Treat salaries (>200) as annual, hourly as /hr
  const binWage = (emp) => {
    const w = getWage(emp, yearKey);
    if(!w) return -1;
    if(w >= 1000) return bins.findIndex(b=>b.isSalary);
    return bins.findIndex(b=>w>=b.min && w<b.max);
  };

  destroyChart('dist-chart');
  const ctx = document.getElementById('dist-chart').getContext('2d');

  if(groupDim === 'all') {
    const counts = bins.map((_,i) => filteredData.filter(e=>binWage(e)===i).length);
    charts['dist-chart'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins.map(b=>b.label),
        datasets: [{ data: counts, backgroundColor: PALETTE.map(c=>c+'99'), borderColor: PALETTE, borderWidth: 1.5, borderRadius: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#4a5170', font: { size: 11 } } },
          y: { title: { display: true, text: '# Employees', color: '#4a5170' }, beginAtZero: true }
        }
      }
    });
  } else {
    const groups = uniqueGroupVals(groupDim);
    const datasets = groups.map((g,gi) => ({
      label: g,
      data: bins.map((_,i) => filteredData.filter(e=>getField(e,groupDim)===g && binWage(e)===i).length),
      backgroundColor: PALETTE[gi]+'aa',
      borderColor: PALETTE[gi],
      borderWidth: 1.5, borderRadius: 4
    }));
    charts['dist-chart'] = new Chart(ctx, {
      type: 'bar',
      data: { labels: bins.map(b=>b.label), datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { color: '#8892b0', boxWidth: 12, padding: 16 } } },
        scales: {
          x: { ticks: { color: '#4a5170', font: { size: 11 } } },
          y: { stacked: false, beginAtZero: true, title: { display: true, text: '# Employees', color: '#4a5170' } }
        }
      }
    });
  }
}

function uniqueGroupVals(dim) {
  return [...new Set(filteredData.map(e=>getField(e,dim)).filter(Boolean))].sort();
}

/* ── JOB BREAKDOWN ── */
function renderJobBreakdown() {
  const yearKey = document.getElementById('job-year').value;
  const groupFilter = document.getElementById('job-group').value;

  let data = filteredData;
  if(groupFilter !== 'all') {
    data = data.filter(e => e.Gender===groupFilter || e.Race===groupFilter);
  }

  const jobs = [...new Set(data.map(e=>e.JobTitle).filter(Boolean))].sort();
  const avgWages = jobs.map(j => {
    const vals = data.filter(e=>e.JobTitle===j).map(e=>getWage(e,yearKey)).filter(v=>v!==null);
    return vals.length ? avg(vals) : 0;
  });

  // Sort by avg wage descending
  const sorted = jobs.map((j,i)=>({job:j,wage:avgWages[i]})).sort((a,b)=>b.wage-a.wage);

  destroyChart('job-chart');
  const ctx = document.getElementById('job-chart').getContext('2d');
  charts['job-chart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(s=>s.job),
      datasets: [{
        data: sorted.map(s=>+s.wage.toFixed(2)),
        backgroundColor: PALETTE.slice(0,sorted.length).map(c=>c+'bb'),
        borderColor: PALETTE.slice(0,sorted.length),
        borderWidth: 1.5, borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: ctx => fmt$(ctx.raw) } }
      },
      scales: {
        x: {
          title: { display: true, text: 'Avg Wage', color: '#4a5170' },
          ticks: { callback: v => v>=1000?'$'+Math.round(v/1000)+'K':'$'+v }
        },
        y: { ticks: { color: '#8892b0', font: { size: 11 } } }
      }
    }
  });
}

/* ── WAGE TREND ── */
function renderTrend() {
  const dim  = document.getElementById('trend-dim').value;
  const span = document.getElementById('trend-span').value;
  const years = yearsFromSpan(span);
  const groups = uniqueGroupVals(dim);

  // Limit to 8 groups for readability
  const displayGroups = groups.slice(0,8);

  const datasets = displayGroups.map((g,gi) => {
    const group = filteredData.filter(e=>getField(e,dim)===g);
    const data  = years.map(y => {
      const v = groupAvgWage(group, wageKey(y));
      return v ? +v.toFixed(2) : null;
    });
    return {
      label: g, data,
      borderColor: PALETTE[gi], backgroundColor: PALETTE[gi]+'22',
      borderWidth: 2, pointRadius: 4, pointHoverRadius: 6,
      tension: 0.4, fill: false
    };
  });

  destroyChart('trend-chart');
  const ctx = document.getElementById('trend-chart').getContext('2d');
  charts['trend-chart'] = new Chart(ctx, {
    type: 'line',
    data: { labels: years, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: '#8892b0', boxWidth: 12, padding: 14, font: { size: 11 } } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${fmt$(ctx.raw)}` } }
      },
      scales: {
        x: { ticks: { color: '#4a5170' } },
        y: {
          title: { display: true, text: 'Average Wage', color: '#4a5170' },
          ticks: { callback: v => v>=1000?'$'+Math.round(v/1000)+'K':'$'+v }
        }
      }
    }
  });
}

/* ── DEMOGRAPHICS DONUT ── */
function renderDemographics() {
  const dim = document.getElementById('demo-dim').value;
  const groups = uniqueGroupVals(dim);
  const counts = groups.map(g => filteredData.filter(e=>getField(e,dim)===g).length);
  const total  = counts.reduce((a,b)=>a+b,0);

  destroyChart('demo-chart');
  const ctx = document.getElementById('demo-chart').getContext('2d');
  charts['demo-chart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: groups,
      datasets: [{
        data: counts,
        backgroundColor: PALETTE.slice(0,groups.length).map(c=>c+'cc'),
        borderColor: PALETTE.slice(0,groups.length),
        borderWidth: 2, hoverOffset: 10
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const v = ctx.raw;
              const pct = total ? (v/total*100).toFixed(1) : '0';
              return `${ctx.label}: ${fmtN(v)} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  // Custom legend
  const legend = document.getElementById('demo-legend');
  legend.innerHTML = groups.map((g,i) => {
    const pct = total ? (counts[i]/total*100).toFixed(1) : '0';
    return `<div class="legend-item">
      <div class="legend-dot" style="background:${PALETTE[i]}"></div>
      <span>${g}</span>
      <span style="color:#4a5170;margin-left:4px">${pct}%</span>
    </div>`;
  }).join('');
}

/* ── AGE DISTRIBUTION ── */
function renderAgeDistribution() {
  const dim = document.getElementById('age-dim').value;
  const groups = uniqueGroupVals(dim);

  // Age bins
  const ageBins = [
    {label:'<25',min:0,max:25},{label:'25-29',min:25,max:30},
    {label:'30-34',min:30,max:35},{label:'35-39',min:35,max:40},
    {label:'40-44',min:40,max:45},{label:'45-49',min:45,max:50},
    {label:'50-54',min:50,max:55},{label:'55-59',min:55,max:60},
    {label:'60-64',min:60,max:65},{label:'65+',min:65,max:Infinity}
  ];

  const datasets = groups.slice(0,6).map((g,gi) => {
    const group = filteredData.filter(e=>getField(e,dim)===g);
    const data  = ageBins.map(b => group.filter(e=>{
      const a = parseFloat(e.Age); return !isNaN(a) && a>=b.min && a<b.max;
    }).length);
    return {
      label: g, data,
      backgroundColor: PALETTE[gi]+'99',
      borderColor: PALETTE[gi],
      borderWidth: 1.5, borderRadius: 5
    };
  });

  destroyChart('age-chart');
  const ctx = document.getElementById('age-chart').getContext('2d');
  charts['age-chart'] = new Chart(ctx, {
    type: 'bar',
    data: { labels: ageBins.map(b=>b.label), datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: '#8892b0', boxWidth: 12, padding: 14, font: { size: 11 } } }
      },
      scales: {
        x: { ticks: { color: '#4a5170' } },
        y: { beginAtZero: true, title: { display: true, text: '# Employees', color: '#4a5170' } }
      }
    }
  });
}

/* ── RENDER ALL ── */
function renderAll() {
  renderComparison();
  renderDistribution();
  renderJobBreakdown();
  renderTrend();
  renderDemographics();
  renderAgeDistribution();
}

/* ── INIT ── */
function init() {
  filteredData = [...EMPLOYEE_DATA];
  populateJobSelect();
  // Init chip-based compare: default Gender → Female (A) vs Male (B)
  cmpValA = 'Female';
  cmpValB = 'Male';
  renderChips();
  updateKPIs();
  renderAll();
}

window.addEventListener('DOMContentLoaded', init);
