/* ====================================
   Mr. Macky's Cajun Cuisine HR Dashboard
   Main Application Logic
   ==================================== */

// ===== Chart.js Global Config =====
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
Chart.defaults.plugins.tooltip.backgroundColor = '#1a1f35';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
Chart.defaults.animation.duration = 800;
Chart.defaults.animation.easing = 'easeOutQuart';

const COLORS = {
    orange: '#f97316',
    orangeLight: '#fb923c',
    purple: '#a78bfa',
    purpleDark: '#8b5cf6',
    teal: '#2dd4bf',
    tealDark: '#14b8a6',
    rose: '#fb7185',
    roseDark: '#f43f5e',
    blue: '#60a5fa',
    blueDark: '#3b82f6',
    green: '#34d399',
    greenDark: '#10b981',
    amber: '#fbbf24',
    amberDark: '#f59e0b',
    red: '#ef4444',
    slate: '#64748b',
};

const CHART_COLORS = [COLORS.orange, COLORS.purple, COLORS.teal, COLORS.rose, COLORS.blue, COLORS.green, COLORS.amber, COLORS.red, COLORS.slate];

function alpha(color, a) {
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }
    return color;
}

// ===== State =====
let activeCharts = {};
const D = DASHBOARD_DATA;

// ===== Navigation =====
function switchModule(moduleId, linkEl) {
    // Hide all sections
    document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Show target
    const section = document.getElementById('section-' + moduleId);
    if (section) section.classList.add('active');
    if (linkEl) linkEl.classList.add('active');

    // Update title
    const titles = {
        'overview': 'Executive Overview',
        'module1': 'Module 1: Workforce Summary',
        'module2': 'Module 2: Flight Risk & Turnover',
        'module3': 'Module 3: Diversity & Inclusion',
        'module4': 'Module 4: Compensation & Value',
        'anomalies': 'Data Anomalies',
        'exercises': 'Student Exercises',
        'chartbuilder': 'Chart Builder',
        'explore': 'Explore Data',
        'stats': 'Statistical Analysis',
        'datadict': 'Data Dictionary',
    };
    document.getElementById('pageTitle').textContent = titles[moduleId] || 'Dashboard';

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Render charts for this module
    renderModule(moduleId);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ===== KPI Card Helper =====
function createKPI(label, value, detail, colorClass) {
    const card = document.createElement('div');
    card.className = `kpi-card ${colorClass}`;
    card.innerHTML = `
        <div class="kpi-label">${label}</div>
        <div class="kpi-value">${value}</div>
        ${detail ? `<div class="kpi-detail">${detail}</div>` : ''}
    `;
    return card;
}

function clearKPIs(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
    return el;
}

// ===== Chart Helper =====
function makeChart(canvasId, config) {
    if (activeCharts[canvasId]) {
        activeCharts[canvasId].destroy();
    }
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    const chart = new Chart(ctx, config);
    activeCharts[canvasId] = chart;
    return chart;
}

function formatNumber(n) {
    if (n === null || n === undefined) return '—';
    if (typeof n === 'number') {
        if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return n.toLocaleString();
        return n.toString();
    }
    return n;
}

function formatCurrency(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1000) return '$' + n.toLocaleString();
    return '$' + n.toFixed(2);
}

function formatPercent(n) {
    if (n === null || n === undefined) return '—';
    return (n * 100).toFixed(1) + '%';
}

// ===== Module Renderers =====
const rendered = {};

function renderModule(moduleId) {
    if (rendered[moduleId]) return;
    rendered[moduleId] = true;

    switch (moduleId) {
        case 'overview': renderOverview(); break;
        case 'module1': renderModule1(); break;
        case 'module2': renderModule2(); break;
        case 'module3': renderModule3(); break;
        case 'module4': renderModule4(); break;
        case 'anomalies': renderAnomalies(); break;
        case 'exercises': renderExercises(); break;
        case 'chartbuilder': renderChartBuilder(); break;
        case 'explore': renderExploreData(); break;
        case 'stats': renderStats(); break;
        case 'datadict': renderDataDictionary(); break;
    }
}

// ===== OVERVIEW =====
function renderOverview() {
    const m1 = D.module1;
    const m2 = D.module2;
    const m3 = D.module3;

    const kpiGrid = clearKPIs('overviewKPIs');
    kpiGrid.appendChild(createKPI('Current Headcount', formatNumber(m1.totalHeadcount), 'Active employees', 'orange'));
    kpiGrid.appendChild(createKPI('Restaurant Units', Object.keys(m1.unitHeadcount).length, 'Large & Medium markets', 'purple'));
    kpiGrid.appendChild(createKPI('Total Turnover', formatNumber(m2.statusCounts['Quit'] + m2.statusCounts['Discharged']), `${formatNumber(m2.statusCounts['Quit'])} quits · ${formatNumber(m2.statusCounts['Discharged'])} discharged`, 'rose'));
    kpiGrid.appendChild(createKPI('Applicants Reviewed', formatNumber(m3.hireByRace.White.total + m3.hireByRace.URM.total), 'AM selection pipeline', 'teal'));

    // Calculate overall engagement
    const eng = D.engagement.companyAvg;
    const avgEng = Object.values(eng).filter(v => v !== null);
    const overallEng = avgEng.length ? (avgEng.reduce((a, b) => a + b, 0) / avgEng.length).toFixed(2) : '—';
    kpiGrid.appendChild(createKPI('Avg Engagement', overallEng + '/7', '2026 company-wide', 'green'));

    // Avg profit
    const profits = Object.values(D.restaurant.performanceByUnit2026).map(u => u.profit).filter(p => p != null);
    const avgProfit = profits.length ? Math.round(profits.reduce((a, b) => a + b, 0) / profits.length) : 0;
    kpiGrid.appendChild(createKPI('Avg Unit Profit', formatCurrency(avgProfit), '2026 across all units', 'amber'));

    // Turnover trend chart
    const years = Object.keys(m2.turnoverByYear).sort();
    makeChart('overviewTurnoverChart', {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Quits',
                    data: years.map(y => m2.turnoverByYear[y].quit),
                    borderColor: COLORS.rose,
                    backgroundColor: alpha(COLORS.rose, 0.1),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Discharges',
                    data: years.map(y => m2.turnoverByYear[y].discharged),
                    borderColor: COLORS.amber,
                    backgroundColor: alpha(COLORS.amber, 0.1),
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Engagement radar with market comparison
    const engFields = Object.keys(eng);
    const engLabels = engFields.map(k => k.replace(/([A-Z])/g, ' $1').trim());
    const engValues = engFields.map(k => eng[k]);
    const engByMarket = D.engagement.engByMarket || {};
    const radarDatasets = [{
        label: 'Company Average',
        data: engValues,
        borderColor: COLORS.teal,
        backgroundColor: alpha(COLORS.teal, 0.15),
        borderWidth: 2.5,
        pointBackgroundColor: COLORS.teal,
        pointRadius: 3,
    }];
    if (engByMarket.Large) {
        radarDatasets.push({
            label: 'Large Market',
            data: engFields.map(k => engByMarket.Large[k]),
            borderColor: COLORS.blue,
            backgroundColor: alpha(COLORS.blue, 0.08),
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointBackgroundColor: COLORS.blue,
            pointRadius: 2,
        });
    }
    if (engByMarket.Medium) {
        radarDatasets.push({
            label: 'Medium Market',
            data: engFields.map(k => engByMarket.Medium[k]),
            borderColor: COLORS.purple,
            backgroundColor: alpha(COLORS.purple, 0.08),
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointBackgroundColor: COLORS.purple,
            pointRadius: 2,
        });
    }
    makeChart('overviewEngagementChart', {
        type: 'radar',
        data: {
            labels: engLabels,
            datasets: radarDatasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#e2e8f0', font: { size: 12 }, padding: 16 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}`
                    }
                }
            },
            scales: {
                r: {
                    min: 3.0,
                    max: 5.0,
                    ticks: { stepSize: 0.5, backdropColor: 'rgba(15,23,42,0.75)', color: '#cbd5e1', font: { size: 11 }, z: 1 },
                    grid: { color: 'rgba(148,163,184,0.18)', lineWidth: 1 },
                    angleLines: { color: 'rgba(148,163,184,0.15)' },
                    pointLabels: { color: '#e2e8f0', font: { size: 12, weight: '500' }, padding: 12 }
                }
            }
        }
    });
}

// ===== MODULE 1: WORKFORCE SUMMARY =====
function renderModule1() {
    const m = D.module1;

    const kpiGrid = clearKPIs('module1KPIs');
    kpiGrid.appendChild(createKPI('Total Headcount', formatNumber(m.totalHeadcount), '', 'orange'));
    kpiGrid.appendChild(createKPI('Large Market', formatNumber(m.marketCounts['Large'] || 0), `${((m.marketCounts['Large'] || 0) / m.totalHeadcount * 100).toFixed(1)}% of workforce`, 'blue'));
    kpiGrid.appendChild(createKPI('Medium Market', formatNumber(m.marketCounts['Medium'] || 0), `${((m.marketCounts['Medium'] || 0) / m.totalHeadcount * 100).toFixed(1)}% of workforce`, 'purple'));
    const mgrCount = m.jobCounts['Manager'] || 0;
    kpiGrid.appendChild(createKPI('Managers', formatNumber(mgrCount), `${(mgrCount / m.totalHeadcount * 100).toFixed(1)}% of headcount`, 'teal'));
    kpiGrid.appendChild(createKPI('Male', formatNumber(m.genderCounts['Male'] || 0), '', 'blue'));
    kpiGrid.appendChild(createKPI('Female', formatNumber(m.genderCounts['Female'] || 0), '', 'rose'));

    // Age distribution
    const ageLabels = Object.keys(m.ageBrackets);
    const ageValues = Object.values(m.ageBrackets);
    makeChart('m1AgeChart', {
        type: 'bar',
        data: {
            labels: ageLabels,
            datasets: [{
                label: 'Employees',
                data: ageValues,
                backgroundColor: ageLabels.map((_, i) => alpha(CHART_COLORS[i % CHART_COLORS.length], 0.7)),
                borderColor: ageLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Gender doughnut
    makeChart('m1GenderChart', {
        type: 'doughnut',
        data: {
            labels: Object.keys(m.genderCounts),
            datasets: [{
                data: Object.values(m.genderCounts),
                backgroundColor: [alpha(COLORS.blue, 0.8), alpha(COLORS.rose, 0.8)],
                borderColor: [COLORS.blue, COLORS.rose],
                borderWidth: 2,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom' },
            }
        }
    });

    // Job title distribution
    const jobLabels = Object.keys(m.jobCounts);
    makeChart('m1JobChart', {
        type: 'bar',
        data: {
            labels: jobLabels,
            datasets: [{
                label: 'Count',
                data: jobLabels.map(j => m.jobCounts[j]),
                backgroundColor: jobLabels.map((_, i) => alpha(CHART_COLORS[i % CHART_COLORS.length], 0.7)),
                borderColor: jobLabels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { grid: { display: false } }
            }
        }
    });

    // Market distribution pie
    makeChart('m1MarketChart', {
        type: 'doughnut',
        data: {
            labels: Object.keys(m.marketCounts),
            datasets: [{
                data: Object.values(m.marketCounts),
                backgroundColor: [alpha(COLORS.blue, 0.8), alpha(COLORS.purple, 0.8)],
                borderColor: [COLORS.blue, COLORS.purple],
                borderWidth: 2,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // Top recruitment sources
    const recruitEntries = Object.entries(m.recruitmentCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    makeChart('m1RecruitChart', {
        type: 'bar',
        data: {
            labels: recruitEntries.map(e => e[0]),
            datasets: [{
                label: 'Employees Hired',
                data: recruitEntries.map(e => e[1]),
                backgroundColor: alpha(COLORS.teal, 0.6),
                borderColor: COLORS.teal,
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Manager performance by recruitment source
    const perfEntries = Object.entries(m.avgPerfByRecruitMgr).sort((a, b) => b[1] - a[1]);
    makeChart('m1PerfByRecruitChart', {
        type: 'bar',
        data: {
            labels: perfEntries.map(e => e[0]),
            datasets: [{
                label: 'Avg Performance Rating (2026)',
                data: perfEntries.map(e => e[1]),
                backgroundColor: perfEntries.map(e => e[1] >= 4 ? alpha(COLORS.green, 0.7) : e[1] >= 3 ? alpha(COLORS.amber, 0.7) : alpha(COLORS.red, 0.7)),
                borderColor: perfEntries.map(e => e[1] >= 4 ? COLORS.green : e[1] >= 3 ? COLORS.amber : COLORS.red),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 5, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// ===== MODULE 2: FLIGHT RISK =====
function renderModule2() {
    const m = D.module2;

    const kpiGrid = clearKPIs('module2KPIs');
    const totalEmployees = m.statusCounts['Employed'] || 0;
    const totalQuit = m.statusCounts['Quit'] || 0;
    const totalDischarged = m.statusCounts['Discharged'] || 0;
    const totalSeparated = totalQuit + totalDischarged;
    const turnoverRate = totalSeparated / (totalEmployees + totalSeparated);

    kpiGrid.appendChild(createKPI('Currently Employed', formatNumber(totalEmployees), '', 'green'));
    kpiGrid.appendChild(createKPI('Total Quits', formatNumber(totalQuit), `${(totalQuit / (totalEmployees + totalSeparated) * 100).toFixed(1)}% of all records`, 'rose'));
    kpiGrid.appendChild(createKPI('Total Discharges', formatNumber(totalDischarged), `${(totalDischarged / (totalEmployees + totalSeparated) * 100).toFixed(1)}% of all records`, 'amber'));
    kpiGrid.appendChild(createKPI('Overall Turnover Rate', (turnoverRate * 100).toFixed(1) + '%', 'Historical cumulative', 'red'));

    // Avg perf by status
    kpiGrid.appendChild(createKPI('Avg Perf (Employed)', m.avgPerfByStatus['Employed'] || '—', 'Latest rating', 'blue'));
    kpiGrid.appendChild(createKPI('Avg Perf (Quit)', m.avgPerfByStatus['Quit'] || '—', 'At time of departure', 'purple'));

    // Turnover by year
    const years = Object.keys(m.turnoverByYear).sort();
    makeChart('m2YearChart', {
        type: 'bar',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Quits',
                    data: years.map(y => m.turnoverByYear[y].quit),
                    backgroundColor: alpha(COLORS.rose, 0.7),
                    borderColor: COLORS.rose,
                    borderWidth: 1.5,
                    borderRadius: 4,
                },
                {
                    label: 'Discharges',
                    data: years.map(y => m.turnoverByYear[y].discharged),
                    backgroundColor: alpha(COLORS.amber, 0.7),
                    borderColor: COLORS.amber,
                    borderWidth: 1.5,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, stacked: false, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Performance by status
    const statuses = Object.keys(m.avgPerfByStatus);
    makeChart('m2PerfStatusChart', {
        type: 'bar',
        data: {
            labels: statuses,
            datasets: [{
                label: 'Avg Performance Rating',
                data: statuses.map(s => m.avgPerfByStatus[s]),
                backgroundColor: statuses.map(s => s === 'Employed' ? alpha(COLORS.green, 0.7) : s === 'Quit' ? alpha(COLORS.rose, 0.7) : alpha(COLORS.amber, 0.7)),
                borderColor: statuses.map(s => s === 'Employed' ? COLORS.green : s === 'Quit' ? COLORS.rose : COLORS.amber),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 5, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Turnover by job title
    const jobs = Object.keys(m.turnoverByJob);
    makeChart('m2JobChart', {
        type: 'bar',
        data: {
            labels: jobs,
            datasets: [
                {
                    label: 'Employed',
                    data: jobs.map(j => m.turnoverByJob[j].employed),
                    backgroundColor: alpha(COLORS.green, 0.7),
                    borderColor: COLORS.green,
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Quit',
                    data: jobs.map(j => m.turnoverByJob[j].quit),
                    backgroundColor: alpha(COLORS.rose, 0.7),
                    borderColor: COLORS.rose,
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Discharged',
                    data: jobs.map(j => m.turnoverByJob[j].discharged),
                    backgroundColor: alpha(COLORS.amber, 0.7),
                    borderColor: COLORS.amber,
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            indexAxis: 'y',
            scales: {
                x: { beginAtZero: true, stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                y: { stacked: true, grid: { display: false } }
            }
        }
    });

    // Status pie
    makeChart('m2StatusPie', {
        type: 'doughnut',
        data: {
            labels: statuses,
            datasets: [{
                data: statuses.map(s => m.statusCounts[s]),
                backgroundColor: [alpha(COLORS.green, 0.8), alpha(COLORS.rose, 0.8), alpha(COLORS.amber, 0.8)],
                borderColor: [COLORS.green, COLORS.rose, COLORS.amber],
                borderWidth: 2,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // Flight risk map
    renderFlightRiskMap();
}

function renderFlightRiskMap() {
    const container = document.getElementById('flightRiskMap');
    if (!container) return;
    container.innerHTML = '';

    const m = D.module2;
    const filter = document.getElementById('m2MarketFilter').value;

    const units = Object.entries(m.turnoverByUnit)
        .filter(([_, v]) => filter === 'all' || v.market === filter)
        .sort((a, b) => {
            const rateA = (a[1].quit + a[1].discharged) / a[1].total;
            const rateB = (b[1].quit + b[1].discharged) / b[1].total;
            return rateB - rateA;
        });

    units.forEach(([unitId, data]) => {
        const rate = data.total > 0 ? (data.quit + data.discharged) / data.total : 0;
        const riskClass = rate > 0.7 ? 'risk-high' : rate > 0.5 ? 'risk-medium' : 'risk-low';

        const cell = document.createElement('div');
        cell.className = `heatmap-cell ${riskClass}`;
        cell.innerHTML = `
            <div class="cell-unit">Unit ${unitId}</div>
            <div class="cell-value">${(rate * 100).toFixed(0)}%</div>
            <div class="cell-label">${data.market}</div>
        `;
        cell.title = `Unit ${unitId} (${data.market})\nQuits: ${data.quit}\nDischarged: ${data.discharged}\nEmployed: ${data.employed}\nTurnover Rate: ${(rate * 100).toFixed(1)}%`;
        container.appendChild(cell);
    });
}

// ===== MODULE 3: DIVERSITY & INCLUSION =====
function renderModule3() {
    const m = D.module3;

    const kpiGrid = clearKPIs('module3KPIs');
    const whiteRate = m.hireByRace.White ? m.hireByRace.White.hired / m.hireByRace.White.total : 0;
    const urmRate = m.hireByRace.URM ? m.hireByRace.URM.hired / m.hireByRace.URM.total : 0;
    const maleRate = m.hireByGender.Male ? m.hireByGender.Male.hired / m.hireByGender.Male.total : 0;
    const femaleRate = m.hireByGender.Female ? m.hireByGender.Female.hired / m.hireByGender.Female.total : 0;
    const impactRatio = whiteRate > 0 ? urmRate / whiteRate : 0;

    kpiGrid.appendChild(createKPI('White Hiring Rate', (whiteRate * 100).toFixed(1) + '%', `${m.hireByRace.White.hired} of ${m.hireByRace.White.total} applicants`, 'blue'));
    kpiGrid.appendChild(createKPI('URM Hiring Rate', (urmRate * 100).toFixed(1) + '%', `${m.hireByRace.URM.hired} of ${m.hireByRace.URM.total} applicants`, 'purple'));
    kpiGrid.appendChild(createKPI('Male Hiring Rate', (maleRate * 100).toFixed(1) + '%', `${m.hireByGender.Male.hired} of ${m.hireByGender.Male.total}`, 'teal'));
    kpiGrid.appendChild(createKPI('Female Hiring Rate', (femaleRate * 100).toFixed(1) + '%', `${m.hireByGender.Female.hired} of ${m.hireByGender.Female.total}`, 'rose'));
    kpiGrid.appendChild(createKPI('4/5ths Impact Ratio', impactRatio.toFixed(3), impactRatio < 0.8 ? '⚠️ Below 0.80 threshold' : '✅ Above 0.80 threshold', impactRatio < 0.8 ? 'red' : 'green'));
    kpiGrid.appendChild(createKPI('Total Applicants', formatNumber(m.hireByRace.White.total + m.hireByRace.URM.total), 'AM position pipeline', 'amber'));

    // Hiring rate by race
    makeChart('m3RaceChart', {
        type: 'bar',
        data: {
            labels: Object.keys(m.hireByRace),
            datasets: [
                {
                    label: 'Hired',
                    data: Object.values(m.hireByRace).map(v => v.hired),
                    backgroundColor: alpha(COLORS.green, 0.7),
                    borderColor: COLORS.green,
                    borderWidth: 1.5,
                    borderRadius: 4,
                },
                {
                    label: 'Not Hired',
                    data: Object.values(m.hireByRace).map(v => v.notHired),
                    backgroundColor: alpha(COLORS.red, 0.5),
                    borderColor: COLORS.red,
                    borderWidth: 1.5,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { stacked: true, grid: { display: false } }
            }
        }
    });

    // Hiring by gender
    makeChart('m3GenderChart', {
        type: 'bar',
        data: {
            labels: Object.keys(m.hireByGender),
            datasets: [
                {
                    label: 'Hired',
                    data: Object.values(m.hireByGender).map(v => v.hired),
                    backgroundColor: alpha(COLORS.green, 0.7),
                    borderColor: COLORS.green,
                    borderWidth: 1.5,
                    borderRadius: 4,
                },
                {
                    label: 'Not Hired',
                    data: Object.values(m.hireByGender).map(v => v.notHired),
                    backgroundColor: alpha(COLORS.red, 0.5),
                    borderColor: COLORS.red,
                    borderWidth: 1.5,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { stacked: true, grid: { display: false } }
            }
        }
    });

    // Cross-sectional hiring rates
    const crossKeys = Object.keys(m.hireCross);
    const crossLabels = crossKeys.map(k => k.replace('_', ' '));
    const crossRates = crossKeys.map(k => m.hireCross[k].total > 0 ? (m.hireCross[k].hired / m.hireCross[k].total * 100) : 0);
    makeChart('m3CrossChart', {
        type: 'bar',
        data: {
            labels: crossLabels,
            datasets: [{
                label: 'Hiring Rate (%)',
                data: crossRates,
                backgroundColor: crossKeys.map((_, i) => alpha(CHART_COLORS[i], 0.7)),
                borderColor: crossKeys.map((_, i) => CHART_COLORS[i]),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Avg interview scores
    const intKeys = Object.keys(m.avgInterviews);
    const intLabels = intKeys.map(k => k.replace(/_/g, ' '));
    makeChart('m3InterviewChart', {
        type: 'bar',
        data: {
            labels: intLabels,
            datasets: [
                {
                    label: 'Interview 1',
                    data: intKeys.map(k => m.avgInterviews[k].avgInterview1),
                    backgroundColor: alpha(COLORS.blue, 0.7),
                    borderColor: COLORS.blue,
                    borderWidth: 1.5,
                    borderRadius: 4,
                },
                {
                    label: 'Interview 2',
                    data: intKeys.map(k => m.avgInterviews[k].avgInterview2),
                    backgroundColor: alpha(COLORS.purple, 0.7),
                    borderColor: COLORS.purple,
                    borderWidth: 1.5,
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxRotation: 45 } }
            }
        }
    });

    // Hiring trend by year
    const hireYears = Object.keys(m.hireByYear).sort();
    makeChart('m3YearChart', {
        type: 'line',
        data: {
            labels: hireYears,
            datasets: [
                {
                    label: 'White Hiring Rate',
                    data: hireYears.map(y => {
                        const d = m.hireByYear[y]?.White;
                        return d && d.total > 0 ? (d.hired / d.total * 100).toFixed(1) : null;
                    }),
                    borderColor: COLORS.blue,
                    backgroundColor: alpha(COLORS.blue, 0.1),
                    fill: false,
                    tension: 0.3,
                    borderWidth: 2.5,
                    pointRadius: 4,
                },
                {
                    label: 'URM Hiring Rate',
                    data: hireYears.map(y => {
                        const d = m.hireByYear[y]?.URM;
                        return d && d.total > 0 ? (d.hired / d.total * 100).toFixed(1) : null;
                    }),
                    borderColor: COLORS.purple,
                    backgroundColor: alpha(COLORS.purple, 0.1),
                    fill: false,
                    tension: 0.3,
                    borderWidth: 2.5,
                    pointRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Current workforce diversity by role
    const diversityJobs = Object.keys(m.currentDiversity);
    const races = [...new Set(diversityJobs.flatMap(j => Object.keys(m.currentDiversity[j])))];
    makeChart('m3DiversityChart', {
        type: 'bar',
        data: {
            labels: diversityJobs,
            datasets: races.map((race, i) => ({
                label: race,
                data: diversityJobs.map(j => m.currentDiversity[j][race] || 0),
                backgroundColor: alpha(CHART_COLORS[i], 0.7),
                borderColor: CHART_COLORS[i],
                borderWidth: 1.5,
                borderRadius: 4,
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { stacked: true, grid: { display: false } }
            }
        }
    });

    // Adverse impact analysis box
    const box = document.getElementById('adverseImpactBox');
    box.innerHTML = `
        <h3>⚖️ Adverse Impact Analysis (4/5ths Rule)</h3>
        <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
            The 4/5ths (80%) rule states that a selection rate for any race, sex, or ethnic group which is less than 4/5ths of the rate for the group with the highest rate will generally be regarded as evidence of adverse impact.
        </p>
        <div class="impact-metric">
            <span class="metric-label">White Hiring Rate</span>
            <div class="metric-bar"><div class="metric-fill" style="width: ${whiteRate * 100}%; background: ${COLORS.blue};"></div></div>
            <span class="metric-value" style="color: ${COLORS.blue}">${(whiteRate * 100).toFixed(1)}%</span>
        </div>
        <div class="impact-metric">
            <span class="metric-label">URM Hiring Rate</span>
            <div class="metric-bar"><div class="metric-fill" style="width: ${urmRate * 100}%; background: ${COLORS.purple};"></div></div>
            <span class="metric-value" style="color: ${COLORS.purple}">${(urmRate * 100).toFixed(1)}%</span>
        </div>
        <div class="impact-metric">
            <span class="metric-label">Impact Ratio (URM / White)</span>
            <div class="metric-bar"><div class="metric-fill" style="width: ${Math.min(impactRatio * 100, 100)}%; background: ${impactRatio < 0.8 ? COLORS.red : COLORS.green};"></div></div>
            <span class="metric-value" style="color: ${impactRatio < 0.8 ? COLORS.red : COLORS.green}">${impactRatio.toFixed(3)}</span>
        </div>
        <div class="impact-metric">
            <span class="metric-label">4/5ths Threshold</span>
            <div class="metric-bar"><div class="metric-fill" style="width: 80%; background: ${COLORS.amber};"></div></div>
            <span class="metric-value" style="color: ${COLORS.amber}">0.800</span>
        </div>
        <p style="color: var(--text-secondary); font-size: 13px; margin-top: 16px; padding: 12px; background: ${impactRatio < 0.8 ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.08)'}; border-radius: 8px; border-left: 3px solid ${impactRatio < 0.8 ? COLORS.red : COLORS.green};">
            ${impactRatio < 0.8
                ? `<strong style="color: ${COLORS.red};">⚠️ Potential Adverse Impact Detected.</strong> The URM hiring rate is ${(impactRatio * 100).toFixed(1)}% of the White hiring rate, falling below the 80% threshold. This warrants further investigation into selection procedures.`
                : `<strong style="color: ${COLORS.green};">✅ No Adverse Impact.</strong> The URM hiring rate meets the 4/5ths threshold relative to the White hiring rate.`
            }
        </p>
    `;
}

// ===== MODULE 4: COMPENSATION =====
function renderModule4() {
    const m = D.module4;

    const kpiGrid = clearKPIs('module4KPIs');
    kpiGrid.appendChild(createKPI('Compensation Records', formatNumber(m.totalCompRecords), 'Employees with complete data', 'orange'));

    // Calculate overall avg wage
    const allWages = Object.values(m.avgWageByPerf);
    const totalWageSum = allWages.reduce((acc, v) => acc + v.avg * v.count, 0);
    const totalWageCount = allWages.reduce((acc, v) => acc + v.count, 0);
    kpiGrid.appendChild(createKPI('Avg Wage Rate', formatCurrency(totalWageSum / totalWageCount), '2026 across all rated employees', 'blue'));

    // Gender wage data
    if (m.avgWageByDemo.gender_Male && m.avgWageByDemo.gender_Female) {
        kpiGrid.appendChild(createKPI('Avg Male Wage', formatCurrency(m.avgWageByDemo.gender_Male.avg), `n=${m.avgWageByDemo.gender_Male.count}`, 'teal'));
        kpiGrid.appendChild(createKPI('Avg Female Wage', formatCurrency(m.avgWageByDemo.gender_Female.avg), `n=${m.avgWageByDemo.gender_Female.count}`, 'rose'));
    }

    // Wage by performance rating
    const perfLabels = Object.keys(m.avgWageByPerf).sort();
    makeChart('m4WagePerfChart', {
        type: 'bar',
        data: {
            labels: perfLabels.map(p => 'Rating ' + p),
            datasets: [{
                label: 'Avg Wage ($)',
                data: perfLabels.map(p => m.avgWageByPerf[p].avg),
                backgroundColor: perfLabels.map((_, i) => alpha(CHART_COLORS[i], 0.7)),
                borderColor: perfLabels.map((_, i) => CHART_COLORS[i]),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
                x: { grid: { display: false } }
            }
        }
    });

    // Wage by experience
    const expOrder = ['0', '1-2', '3-5', '6-10', '10+'];
    makeChart('m4WageExpChart', {
        type: 'bar',
        data: {
            labels: expOrder.map(e => e + ' yrs'),
            datasets: [{
                label: 'Avg Wage ($)',
                data: expOrder.map(e => m.avgWageByExp[e]?.avg || 0),
                backgroundColor: alpha(COLORS.teal, 0.6),
                borderColor: COLORS.teal,
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
                x: { grid: { display: false } }
            }
        }
    });

    // Performance by experience
    makeChart('m4PerfExpChart', {
        type: 'line',
        data: {
            labels: expOrder.map(e => e + ' yrs'),
            datasets: [{
                label: 'Avg Performance Rating',
                data: expOrder.map(e => m.avgPerfByExp[e] || 0),
                borderColor: COLORS.purple,
                backgroundColor: alpha(COLORS.purple, 0.15),
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: COLORS.purple,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 5, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Demographics wage comparison
    const demoLabels = Object.keys(m.avgWageByDemo).map(k => k.replace('gender_', '').replace('race_', ''));
    const demoValues = Object.values(m.avgWageByDemo).map(v => v.avg);
    makeChart('m4DemoChart', {
        type: 'bar',
        data: {
            labels: demoLabels,
            datasets: [{
                label: 'Avg Wage ($)',
                data: demoValues,
                backgroundColor: demoLabels.map((_, i) => alpha(CHART_COLORS[i], 0.7)),
                borderColor: demoLabels.map((_, i) => CHART_COLORS[i]),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { callback: v => '$' + v.toLocaleString() } },
                x: { grid: { display: false } }
            }
        }
    });

    // Manager scatter
    const perfColors = {
        1: COLORS.red,
        2: COLORS.rose,
        3: COLORS.amber,
        4: COLORS.blue,
        5: COLORS.green,
    };

    const scatterDatasets = [1, 2, 3, 4, 5].map(rating => ({
        label: 'Rating ' + rating,
        data: m.scatterManagers
            .filter(s => s.perf === rating)
            .map(s => ({ x: s.exp, y: s.wage })),
        backgroundColor: alpha(perfColors[rating], 0.6),
        borderColor: perfColors[rating],
        borderWidth: 1,
        pointRadius: 5,
        pointHoverRadius: 7,
    }));

    makeChart('m4ScatterChart', {
        type: 'scatter',
        data: { datasets: scatterDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: {
                    title: { display: true, text: 'Prior Experience (Years)', color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                },
                y: {
                    title: { display: true, text: 'Wage Rate ($)', color: '#94a3b8' },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    ticks: { callback: v => '$' + v.toLocaleString() },
                }
            }
        }
    });
}

// ===== DATA ANOMALIES =====
function renderAnomalies() {
    const grid = document.getElementById('anomaliesGrid');

    // Generate anomalies based on actual data
    const m1 = D.module1;
    const m2 = D.module2;
    const m3 = D.module3;
    const m4 = D.module4;
    const eng = D.engagement;
    const rest = D.restaurant;

    const anomalies = [];

    // Anomaly 1: Medium vs Large market engagement vs profit
    const mediumEng = eng.engByMarket?.Medium;
    const largeEng = eng.engByMarket?.Large;
    if (mediumEng && largeEng) {
        const medAvg = Object.values(mediumEng).filter(v => v !== null).reduce((a, b) => a + b, 0) / Object.values(mediumEng).filter(v => v !== null).length;
        const lrgAvg = Object.values(largeEng).filter(v => v !== null).reduce((a, b) => a + b, 0) / Object.values(largeEng).filter(v => v !== null).length;
        anomalies.push({
            category: 'Engagement vs. Profitability',
            title: 'Medium Market units show higher engagement but lower average profit',
            description: `Medium Market locations average an engagement score of ${medAvg.toFixed(2)}/7 compared to ${lrgAvg.toFixed(2)}/7 for Large Markets. Yet Large Market units generate significantly higher average profit ($${formatNumber(rest.avgProfitByMarket?.Large || 0)}) vs. Medium ($${formatNumber(rest.avgProfitByMarket?.Medium || 0)}). This suggests engagement alone does not drive financial performance — scale and market size are significant moderators.`,
            question: 'If engaged employees don\'t automatically produce higher profits, what other factors (market size, fixed costs, management quality) are driving the gap?'
        });
    }

    // Anomaly 2: Performance ratings of departed employees
    if (m2.avgPerfByStatus) {
        anomalies.push({
            category: 'Turnover & Performance',
            title: 'Employees who quit have similar or higher performance ratings than those discharged',
            description: `The average performance rating for employees who Quit is ${m2.avgPerfByStatus['Quit'] || '—'}/5, while Discharged employees average ${m2.avgPerfByStatus['Discharged'] || '—'}/5, and current employees average ${m2.avgPerfByStatus['Employed'] || '—'}/5. This raises the question of whether the organization is losing its best people voluntarily while retaining underperformers too long before discharge.`,
            question: 'What retention strategies could be implemented to keep high-performing employees who are choosing to leave? Is the discharge process responsive enough?'
        });
    }

    // Anomaly 3: Hiring disparity
    const whiteRate = m3.hireByRace.White ? (m3.hireByRace.White.hired / m3.hireByRace.White.total * 100).toFixed(1) : 0;
    const urmRate = m3.hireByRace.URM ? (m3.hireByRace.URM.hired / m3.hireByRace.URM.total * 100).toFixed(1) : 0;
    anomalies.push({
        category: 'Diversity & Selection',
        title: 'Significant disparity in hiring rates between White and URM applicants',
        description: `White applicants are hired at a rate of ${whiteRate}% while URM applicants are hired at ${urmRate}%. The 4/5ths impact ratio is ${(m3.hireByRace.URM && m3.hireByRace.White ? (m3.hireByRace.URM.hired / m3.hireByRace.URM.total) / (m3.hireByRace.White.hired / m3.hireByRace.White.total) : 0).toFixed(3)}. This pattern persists across multiple application years, suggesting a systemic issue in the selection process rather than a one-time anomaly.`,
        question: 'Are the interview scoring criteria validated for job-relatedness? Could structured interviews or blind screening reduce this disparity?'
    });

    // Anomaly 4: Prior experience and performance disconnect
    anomalies.push({
        category: 'Compensation & Value',
        title: 'Prior experience shows a weak relationship with actual job performance',
        description: `Employees with 0 years of prior experience average a performance rating of ${m4.avgPerfByExp['0'] || '—'}/5, while those with 10+ years average ${m4.avgPerfByExp['10+'] || '—'}/5. Despite this minimal difference in performance outcomes, wage rates increase substantially with experience ($${formatNumber(m4.avgWageByExp['0']?.avg || 0)} for 0 years vs. $${formatNumber(m4.avgWageByExp['10+']?.avg || 0)} for 10+ years). This suggests the organization is paying a premium for experience that may not translate to better performance.`,
        question: 'Should the compensation model weight prior experience as heavily in determining starting wage, or should performance-based pay take precedence?'
    });

    // Anomaly 5: Recruitment source effectiveness
    const recruitPerf = m1.avgPerfByRecruitMgr;
    const topSource = Object.entries(recruitPerf).sort((a, b) => b[1] - a[1])[0];
    const bottomSource = Object.entries(recruitPerf).sort((a, b) => a[1] - b[1])[0];
    if (topSource && bottomSource) {
        anomalies.push({
            category: 'Recruitment Strategy',
            title: `Large performance gap between recruitment sources for managers`,
            description: `Managers recruited through "${topSource[0]}" achieve an average performance rating of ${topSource[1]}/5, while those from "${bottomSource[0]}" average only ${bottomSource[1]}/5. Despite this clear signal, the organization's overall recruitment distribution does not appear to prioritize the highest-performing sources. The most common recruitment source may not be the most effective one.`,
            question: 'Should the recruitment budget be reallocated towards sources that produce higher-performing managers? What explains the performance difference between sources?'
        });
    }

    grid.innerHTML = anomalies.map((a, i) => `
        <div class="anomaly-card" style="animation-delay: ${i * 0.1}s">
            <div class="anomaly-number">${i + 1}</div>
            <div class="anomaly-category">${a.category}</div>
            <div class="anomaly-title">${a.title}</div>
            <div class="anomaly-description">${a.description}</div>
            <div class="anomaly-question">💡 Discussion: ${a.question}</div>
        </div>
    `).join('');
}

// ===== STUDENT EXERCISES =====
function renderExercises() {
    const grid = document.getElementById('exercisesGrid');

    const exercises = [
        {
            number: 1,
            title: 'The "New Hire" Audit',
            module: 'Module 1',
            goal: 'Understand the current workforce composition and evaluate recruitment effectiveness.',
            task: 'Navigate to the <strong>Workforce Summary</strong> module. Use the recruitment source charts to identify the top three recruitment sources for high-performing managers (performance rating ≥ 4) versus hourly staff. Compare these patterns to the overall recruitment distribution.',
            question: 'Based on the "Background" section of the handbook, is our current recruitment strategy maintaining the "Old Family Recipe" culture? Are we recruiting from sources that produce the best performers, or are we relying on quantity over quality?',
            placeholder: 'Identify specific recruitment sources, their avg performance ratings, and whether the strategy aligns with company culture...',
            feedback: [
                '<strong>Top 3 Sources by Performance</strong>: Marquis University (4.50), University of the North (4.41), State U at Alberdale (4.29).',
                '<strong>Highest Volume Sources</strong>: Sung Urban Camp (36 managers) and Hitherdale CC (26 managers) — but their avg performance is lower (3.68 and 3.54).',
                'The company is <strong>recruiting for quantity over quality</strong> — the highest-volume sources produce below-average managers.',
                '<strong>"Old Family Recipe" culture alignment</strong>: If the culture values mentorship and stability, the company should prioritize sources with proven track records (quality) and develop partnerships rather than casting a wide net.',
                '<strong>Recommendation</strong>: Redirect recruitment budget from low-performing sources (National Univ at 3.36) to high-performing ones. Consider whether hospitality-focused programs produce better cultural fits.'
            ],
            feedbackNote: 'Strong answers distinguish between volume and quality, name specific schools with data, and connect findings to the company\'s stated culture.',
            mcqs: [
                {
                    q: 'According to the dashboard, which recruitment source produces managers with the highest average performance?',
                    options: ['Sung Urban Camp', 'Marquis University', 'National University', 'Hitherdale CC'],
                    correct: 1,
                    explanations: [
                        'Incorrect. Sung Urban Camp has the highest volume (36 managers) but their avg performance is only 3.68 — a classic quantity-over-quality trap.',
                        'Correct! Marquis University leads with a 4.50 avg performance rating, despite producing fewer managers. This is a key insight about recruitment quality.',
                        'Incorrect. National University has the lowest avg performance at 3.36. This source should be deprioritized in recruitment strategy.',
                        'Incorrect. Hitherdale CC averages 3.54 performance — below the company average. High volume doesn\'t mean high quality.'
                    ]
                },
                {
                    q: 'What is the total current headcount at Mr. Macky\'s Cajun Cuisine?',
                    options: ['2,729', '6,562', '5,471', '4,103'],
                    correct: 1,
                    explanations: [
                        'Incorrect. 2,729 is the number of Wait staff employees — the largest single job role, but not the total headcount.',
                        'Correct! The dashboard shows 6,562 active employees across all restaurant units and job roles.',
                        'Incorrect. Check the Executive Overview KPI cards for the current total headcount figure.',
                        'Incorrect. This doesn\'t match any headcount figure in the dashboard. Review the Workforce Summary module.'
                    ]
                },
                {
                    q: 'Which job role has the highest headcount in the organization?',
                    options: ['Manager', 'Line cook', 'Bus Person', 'Wait staff'],
                    correct: 3,
                    explanations: [
                        'Incorrect. Managers are a smaller, exempt employee group — they don\'t dominate headcount.',
                        'Incorrect. Line cooks are a significant group but not the largest. Check the Workforce Summary bar chart.',
                        'Incorrect. Bus Person is the second-largest group, but not the top. Look at the job distribution chart.',
                        'Correct! Wait staff make up 2,729 employees — about 41.6% of the total workforce. This dominance heavily influences overall HR metrics.'
                    ]
                }
            ]
        },
        {
            number: 2,
            title: 'The Turnover Impact Study',
            module: 'Module 2',
            goal: 'Examine the cost of losing employees and identify high-risk units.',
            task: 'Navigate to the <strong>Flight Risk</strong> module. Use the market filter to isolate units with high discharge rates (above 70%). Cross-reference these units with the Restaurant Performance data available in the Executive Overview.',
            question: 'Compare high-turnover units to their Profit and Payroll data. Does higher turnover lead to higher fixed operating expenses? Calculate the estimated cost of replacing an employee and determine the financial impact of a 10% reduction in turnover.',
            placeholder: 'Show your calculations for replacement cost. Compare high-turnover vs. low-turnover unit financials...',
            feedback: [
                '<strong>Replacement cost formula</strong>: Industry standard = 50-200% of annual salary. For hourly workers (~$12/hr × 2,080 hrs = $24,960/yr), estimated cost = $6,240–$12,480 per separation.',
                'With <strong>~5,500 separations per year</strong>, total annual turnover cost = <strong>$34M–$69M</strong>.',
                'A <strong>10% reduction</strong> (550 fewer separations) saves approximately <strong>$3.4M–$6.9M</strong> annually.',
                '<strong>High-turnover units</strong> (e.g., #32 with 426 separations, #33 with 420) tend to have <strong>higher payroll costs</strong> due to constant training and onboarding.',
                'But some high-turnover units still generate strong profit — suggesting that <strong>market location</strong> may offset turnover costs in high-revenue areas.'
            ],
            feedbackNote: 'The best answers show specific calculations, name units by number, and consider confounding variables like market type.',
            mcqs: [
                {
                    q: 'In the Flight Risk module, which type of separation is more common company-wide?',
                    options: ['Discharged (involuntary)', 'Quit (voluntary)', 'Retirement', 'They are equal'],
                    correct: 1,
                    explanations: [
                        'Incorrect. While discharges are significant, voluntary quits outnumber them. This distinction matters for designing retention strategies.',
                        'Correct! Voluntary quits significantly outnumber discharges across all years. This means the company has a retention problem, not just a discipline problem — requiring different interventions.',
                        'Incorrect. Retirement is not a tracked separation category in this dataset.',
                        'Incorrect. The two separation types are not equal. Review the Turnover by Year chart to see the clear gap.'
                    ]
                },
                {
                    q: 'Using industry estimates (50-200% of salary), what is the approximate cost of ONE hourly employee separation?',
                    options: ['$1,000–$3,000', '$6,240–$12,480', '$25,000–$50,000', '$500–$1,000'],
                    correct: 1,
                    explanations: [
                        'Incorrect. This estimate is too low. Turnover costs include recruiting, onboarding, training time, lost productivity, and institutional knowledge loss.',
                        'Correct! Based on ~$12/hr × 2,080 hours = $24,960 annual salary. At 50-200%, each separation costs $6,240–$12,480. With ~5,500 separations/year, this is a $34M–$69M annual cost.',
                        'Incorrect. This range would apply to highly specialized or executive roles, not hourly restaurant staff.',
                        'Incorrect. This severely underestimates turnover cost. Even at 25% of salary (below industry standard), cost exceeds $6,000.'
                    ]
                },
                {
                    q: 'What does the dashboard data suggest about the relationship between turnover and unit profitability?',
                    options: [
                        'High turnover always leads to low profit',
                        'There is no relationship at all',
                        'Some high-turnover units still generate strong profit due to market location',
                        'Low turnover guarantees high profit'
                    ],
                    correct: 2,
                    explanations: [
                        'Incorrect. This is an oversimplification. The data shows that some high-turnover units still achieve strong profits, likely because revenue from market location outweighs turnover costs.',
                        'Incorrect. There IS a relationship, but it\'s complicated by confounding variables like market type and location.',
                        'Correct! Large market units can absorb higher turnover costs through greater revenue. This demonstrates why HR metrics must always be analyzed in context — market type is a major confounding variable.',
                        'Incorrect. Low turnover helps reduce costs, but profit depends on many factors including market size, location, and management effectiveness.'
                    ]
                }
            ]
        },
        {
            number: 3,
            title: 'Diversity in Selection',
            module: 'Module 3',
            goal: 'Explore issues in selection, hiring, and diversity using the 4/5ths rule.',
            task: 'Navigate to the <strong>Diversity & Inclusion</strong> module. Examine the AM Applicant Information views. Calculate the hiring rate for URM candidates vs. White candidates using the KPI cards at the top of the module.',
            question: 'Is there evidence of adverse impact in our interview process? Using the 4/5ths rule (impact ratio < 0.80 = potential adverse impact), evaluate whether our selection procedures are discriminatory. What interview score patterns do you notice between groups?',
            placeholder: 'Show the 4/5ths calculation step by step. Compare interview scores by group...',
            feedback: [
                '<strong>White hire rate</strong>: 444 / 7,565 applicants = <strong>5.87%</strong>.',
                '<strong>URM hire rate</strong>: 90 / 3,239 applicants = <strong>2.78%</strong>.',
                '<strong>Impact ratio</strong>: 2.78% / 5.87% = <strong>0.473 (47.3%)</strong> — well below the 0.80 threshold.',
                '<strong>Adverse impact is clearly present</strong>. URM candidates are hired at less than half the rate of White candidates.',
                '<strong>Interview score patterns</strong>: Hired URM avg = 5.59 / 5.58 vs. Hired White avg = 5.91 / 5.87. Not-hired URM avg = 3.68 vs. Not-hired White = 4.17. URM candidates receive <strong>systematically lower scores</strong> in both hired and not-hired categories.',
                '<strong>Root cause investigation needed</strong>: Are interviews structured? Are scoring rubrics consistent? Are interviewers diverse? This pattern suggests potential interviewer bias.'
            ],
            feedbackNote: 'The 4/5ths rule calculation is essential — answers that skip the math miss the core of this exercise.',
            mcqs: [
                {
                    q: 'What is the impact ratio (URM hire rate / White hire rate) based on the dashboard data?',
                    options: ['0.80 (exactly at threshold)', '0.473 (well below threshold)', '0.92 (above threshold)', '0.65 (slightly below threshold)'],
                    correct: 1,
                    explanations: [
                        'Incorrect. 0.80 is the 4/5ths rule threshold, not the actual impact ratio. The actual ratio is much worse.',
                        'Correct! URM hire rate (2.78%) ÷ White hire rate (5.87%) = 0.473. This is far below the 0.80 threshold established by the EEOC, indicating severe adverse impact in the selection process.',
                        'Incorrect. If the ratio were 0.92, there would be no adverse impact concern. The actual situation is much more problematic.',
                        'Incorrect. The actual ratio is even lower than 0.65, indicating more severe adverse impact than this answer suggests.'
                    ]
                },
                {
                    q: 'What does the interview score data reveal about URM candidates who WERE hired?',
                    options: [
                        'They scored identically to hired White candidates',
                        'They scored higher than hired White candidates',
                        'They scored systematically lower than hired White candidates',
                        'Their scores varied too much to draw conclusions'
                    ],
                    correct: 2,
                    explanations: [
                        'Incorrect. Hired URM candidates averaged 5.59/5.58 vs. hired White candidates at 5.91/5.87 — a consistent gap.',
                        'Incorrect. The data shows the opposite pattern — URM candidates received lower scores across the board.',
                        'Correct! Even among hired candidates, URM applicants received lower interview scores (5.59 vs. 5.91). This suggests potential interviewer bias, since these candidates were deemed qualified enough to hire despite lower scores.',
                        'Incorrect. The pattern is quite consistent — URM candidates score lower in both interviews, for both hired and not-hired groups.'
                    ]
                },
                {
                    q: 'According to the 4/5ths rule, what impact ratio threshold indicates potential adverse impact?',
                    options: ['Below 0.50', 'Below 0.80', 'Below 1.00', 'Below 0.95'],
                    correct: 1,
                    explanations: [
                        'Incorrect. While 0.50 would certainly indicate adverse impact, the EEOC threshold is more conservative at 0.80.',
                        'Correct! The 4/5ths (or 80%) rule states that if the selection rate for an underrepresented group is less than 80% (0.80) of the rate for the majority group, adverse impact may exist. Mr. Macky\'s ratio of 0.473 is far below this threshold.',
                        'Incorrect. A ratio below 1.00 just means the rates aren\'t perfectly equal. The legal standard uses 0.80 as the threshold.',
                        'Incorrect. 0.95 would be an unreasonably strict standard. The legally established guideline is 0.80.'
                    ]
                }
            ]
        },
        {
            number: 4,
            title: 'The Experience-Performance Paradox',
            module: 'Module 4',
            goal: 'Analyze whether prior experience predicts on-the-job success.',
            task: 'Navigate to the <strong>Compensation & Value</strong> module. Examine the scatter plot showing Experience vs. Wage colored by Performance Rating. Compare the "Avg Performance by Prior Experience" chart to the "Avg Wage by Prior Experience" chart.',
            question: 'If prior experience doesn\'t strongly predict performance, should it be weighted as heavily in compensation decisions? Design an alternative compensation model that better aligns pay with actual value delivered.',
            placeholder: 'Describe the experience-performance relationship you observe. Propose a new compensation model with specific components...',
            feedback: [
                '<strong>Key finding</strong>: The scatter plot shows <strong>no clear linear relationship</strong> between experience and performance. Managers with 0 years experience can score 5, while those with 4+ years can score 1.',
                '<strong>Experience → Wage</strong>: There IS a positive relationship between experience and pay. The company pays more for experience.',
                '<strong>Experience → Performance</strong>: The relationship is essentially flat. Avg performance hovers around 3.8 regardless of experience level.',
                '<strong>The paradox</strong>: The company pays a premium for experience that <strong>doesn\'t reliably produce better performance</strong>.',
                '<strong>Alternative model components</strong>: (1) Base pay tied to market rate, not experience. (2) Performance bonuses based on actual ratings. (3) Unit-profitability bonuses. (4) Probationary period with performance-based raises rather than experience-based starting salary.',
                '<strong>Counter-argument to consider</strong>: Experience may contribute to intangibles not captured by the 1–5 rating (e.g., crisis management, mentoring, institutional knowledge).'
            ],
            feedbackNote: 'The best answers acknowledge the paradox but also consider limitations of the performance rating system itself.',
            mcqs: [
                {
                    q: 'What does the "Avg Performance by Prior Experience" chart reveal about the experience-performance relationship?',
                    options: [
                        'Strong positive correlation — more experience means better performance',
                        'Strong negative correlation — more experience means worse performance',
                        'Performance is essentially flat (~3.8) regardless of experience level',
                        'Performance doubles with each additional year of experience'
                    ],
                    correct: 2,
                    explanations: [
                        'Incorrect. This is a common assumption, but the data doesn\'t support it. Average performance barely changes with experience.',
                        'Incorrect. While there\'s no positive correlation, there\'s also no meaningful negative one.',
                        'Correct! Average performance hovers around 3.8 at all experience levels. This "flat line" is the paradox — the company pays more for experience, but experience doesn\'t predict better performance.',
                        'Incorrect. Performance ratings don\'t scale that way. The actual data shows almost no change across experience levels.'
                    ]
                },
                {
                    q: 'Which group of managers earns the highest average wage according to the dashboard?',
                    options: [
                        'Managers with 4+ years of experience',
                        'Managers with the highest performance ratings (5)',
                        'Managers with 0 years of prior experience',
                        'Managers in Large Market units'
                    ],
                    correct: 2,
                    explanations: [
                        'Incorrect. While experience correlates with pay, the specifics in this dataset show a surprising result. Check the wage-by-experience data.',
                        'Incorrect. Performance Rating 5 managers earn well, but that\'s not what the wage-by-experience chart shows as the top earners.',
                        'Correct! Counterintuitively, managers with 0 years prior experience earn the highest average wage. This deepens the paradox — not only does experience fail to predict performance, the pay structure doesn\'t consistently reward it either.',
                        'Incorrect. Market type affects unit revenue, but this question asks about the wage-by-experience data specifically.'
                    ]
                },
                {
                    q: 'In the manager scatter plot (Experience vs. Wage by Performance), what pattern is visible for top performers (Rating 5)?',
                    options: [
                        'They cluster in the high-experience, high-wage corner',
                        'They are scattered across all experience levels',
                        'They only appear at 3+ years of experience',
                        'They are concentrated at low wages'
                    ],
                    correct: 1,
                    explanations: [
                        'Incorrect. If this were true, experience would be a reliable predictor of top performance — but the scatter plot shows otherwise.',
                        'Correct! Top performers (green dots) appear at every experience level, from 0 to 7+ years. This visual pattern powerfully demonstrates that experience is NOT a reliable predictor of excellence.',
                        'Incorrect. Some of the best performers have zero prior experience. This is a key insight about the limitations of using experience as a hiring criterion.',
                        'Incorrect. Top performers span a wide wage range. The scatter shows no tight clustering by any metric.'
                    ]
                }
            ]
        },
        {
            number: 5,
            title: 'The Engagement-Profit Puzzle',
            module: 'Data Anomalies',
            goal: 'Critically evaluate the relationship between employee satisfaction and business outcomes.',
            task: 'Review <strong>Data Anomaly #1</strong> and the engagement radar chart on the Executive Overview. Compare Medium vs. Large Market engagement scores with their respective profit figures.',
            question: 'If Medium Market units have higher engagement but lower profit, does this mean engagement doesn\'t matter for business performance? What confounding variables might explain this paradox? Design a study to test your hypothesis.',
            placeholder: 'Explain the engagement-profit paradox. List confounding variables. Describe a study design with specific variables and controls...',
            feedback: [
                '<strong>The paradox</strong>: Medium Market units score higher on several engagement dimensions but often have lower absolute profit than Large Market units.',
                '<strong>Why this doesn\'t mean engagement is irrelevant</strong>: Profit is driven by revenue (market/location/traffic), not just cost efficiency. Medium markets simply have smaller revenue potential.',
                '<strong>Confounding variables</strong>: (1) Market size/location, (2) Customer traffic volume, (3) Manager tenure, (4) Local competition, (5) Unit age/establishment, (6) Cost of living differences affecting staffing costs.',
                '<strong>Better comparison</strong>: Compare engagement to <strong>profit margin (profit/revenue)</strong> rather than absolute profit, or compare units <em>within</em> the same market category.',
                '<strong>Study design</strong>: Quasi-experiment — identify 10 low-engagement units, implement targeted engagement interventions (improved feedback, recognition programs), measure profit changes over 12 months vs. 10 control units with similar baseline metrics.',
                '<strong>Key insight</strong>: This is a <strong>correlation vs. causation</strong> problem. Engagement may drive retention, which reduces costs, which improves margin — but the effect may be masked by market-level revenue differences.'
            ],
            feedbackNote: 'Exceptional answers reference the correlation vs. causation tutorial and propose a controlled study design — not just describe the data.',
            mcqs: [
                {
                    q: 'Which engagement dimension has the highest company-wide average score?',
                    options: ['Support', 'Communication', 'Job Satisfaction', 'Accountability'],
                    correct: 2,
                    explanations: [
                        'Incorrect. Support has one of the lowest engagement scores in the company. Check the engagement radar chart on the Executive Overview.',
                        'Incorrect. Communication ranks in the middle of the engagement dimensions. Look at the full radar chart for comparisons.',
                        'Correct! Job Satisfaction leads all engagement dimensions at 4.32. However, even this top score leaves room for improvement, and the gap between satisfaction and support (lowest at 3.64) suggests targeted intervention opportunities.',
                        'Incorrect. Accountability scores near the middle of the pack. Review the Company Average Engagement data.'
                    ]
                },
                {
                    q: 'Why is comparing engagement directly to absolute profit potentially misleading?',
                    options: [
                        'Because engagement data is unreliable',
                        'Because profit is primarily driven by market size and location, not just employee behavior',
                        'Because engagement is only measured annually',
                        'Because profit data is estimated'
                    ],
                    correct: 1,
                    explanations: [
                        'Incorrect. The engagement data is collected through validated surveys and is reliable for analysis purposes.',
                        'Correct! Large market units generate more revenue due to customer traffic and location, which drives profit regardless of engagement. A unit could have mediocre engagement but great location and still outperform. This is why comparing profit MARGIN or controlling for market type is essential.',
                        'Incorrect. Measurement frequency isn\'t the issue. The problem is about confounding variables in the comparison.',
                        'Incorrect. The financial data in the dashboard represents actual unit performance figures.'
                    ]
                },
                {
                    q: 'What type of logical error does the "engagement = profit" assumption illustrate?',
                    options: [
                        'Sampling bias',
                        'Selection bias',
                        'Correlation vs. causation fallacy',
                        'Survivorship bias'
                    ],
                    correct: 2,
                    explanations: [
                        'Incorrect. Sampling bias relates to how participants are selected for a study, not to how we interpret relationships between variables.',
                        'Incorrect. Selection bias is about systematic differences in who is included in a comparison group.',
                        'Correct! Assuming that because two variables are related (or not related), one must cause the other is the classic correlation vs. causation fallacy. Engagement may contribute to retention, which affects costs, which influences margin — but the relationship is mediated, not direct.',
                        'Incorrect. Survivorship bias involves focusing only on successes while ignoring failures. This scenario is about misinterpreting a statistical relationship.'
                    ]
                }
            ]
        }
    ];

    grid.innerHTML = exercises.map(ex => `
        <div class="exercise-card">
            <div class="exercise-header">
                <div class="exercise-number">${ex.number}</div>
                <div class="exercise-title">${ex.title}</div>
                <span class="exercise-module-badge">${ex.module}</span>
            </div>
            <div class="exercise-section">
                <div class="exercise-section-label">🎯 Goal</div>
                <div class="exercise-section-content">${ex.goal}</div>
            </div>
            <div class="exercise-section">
                <div class="exercise-section-label">📋 Task</div>
                <div class="exercise-section-content">${ex.task}</div>
            </div>
            <div class="exercise-question">
                <strong>🤔 Discussion Question:</strong> ${ex.question}
            </div>
            <div class="exercise-answer-area">
                <label class="exercise-answer-label">📝 Your Answer</label>
                <textarea class="exercise-textarea" id="ex-answer-${ex.number}" placeholder="${ex.placeholder}"></textarea>
                <div class="exercise-answer-btns">
                    <button class="exercise-submit-btn" id="ex-sub-${ex.number}" onclick="submitExercise(${ex.number})">Submit Answer</button>
                    <button class="exercise-feedback-btn" id="ex-fb-btn-${ex.number}" onclick="toggleExerciseFeedback(${ex.number})">💡 View Model Answer</button>
                    <span class="exercise-saved-badge" id="ex-saved-${ex.number}">✓ Saved</span>
                </div>
                <div class="exercise-feedback-panel" id="ex-fb-${ex.number}">
                    <div class="exercise-feedback-title">💡 Model Answer — Key Points</div>
                    <ul>${ex.feedback.map(p => `<li>${p}</li>`).join('')}</ul>
                    ${ex.feedbackNote ? `<div class="exercise-feedback-note">${ex.feedbackNote}</div>` : ''}
                </div>
            </div>
            ${ex.mcqs ? `
            <div class="mcq-section">
                <div class="mcq-section-header">
                    <span class="mcq-section-icon">✅</span>
                    <span class="mcq-section-title">Knowledge Check</span>
                    <span class="mcq-score" id="mcq-score-${ex.number}">0 / ${ex.mcqs.length}</span>
                </div>
                ${ex.mcqs.map((mcq, qi) => `
                <div class="mcq-card" id="mcq-${ex.number}-${qi}">
                    <div class="mcq-question">${qi + 1}. ${mcq.q}</div>
                    <div class="mcq-options">
                        ${mcq.options.map((opt, oi) => `
                        <button class="mcq-option" id="mcq-opt-${ex.number}-${qi}-${oi}" 
                                onclick="checkMCQ(${ex.number}, ${qi}, ${oi}, ${mcq.correct})" 
                                data-explanation="${mcq.explanations[oi].replace(/"/g, '&quot;')}">
                            <span class="mcq-letter">${String.fromCharCode(65 + oi)}</span>
                            <span class="mcq-text">${opt}</span>
                        </button>
                        `).join('')}
                    </div>
                    <div class="mcq-feedback" id="mcq-fb-${ex.number}-${qi}"></div>
                </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `).join('');

    // Restore saved answers
    exercises.forEach(ex => {
        const saved = localStorage.getItem(`macky_ex_${ex.number}`);
        if (saved) {
            const ta = document.getElementById(`ex-answer-${ex.number}`);
            if (ta) { ta.value = saved; ta.classList.add('submitted'); }
            const btn = document.getElementById(`ex-sub-${ex.number}`);
            if (btn) { btn.textContent = '✓ Submitted'; btn.disabled = true; btn.classList.add('done'); }
            const fbBtn = document.getElementById(`ex-fb-btn-${ex.number}`);
            if (fbBtn) fbBtn.classList.add('visible');
            const badge = document.getElementById(`ex-saved-${ex.number}`);
            if (badge) badge.classList.add('visible');
        }
    });

    // Restore saved MCQ states
    restoreMCQStates();
}

function submitExercise(num) {
    const ta = document.getElementById(`ex-answer-${num}`);
    if (!ta || !ta.value.trim()) {
        ta.style.borderColor = '#f43f5e';
        setTimeout(() => ta.style.borderColor = '', 1500);
        return;
    }

    ta.classList.add('submitted');
    localStorage.setItem(`macky_ex_${num}`, ta.value);

    const btn = document.getElementById(`ex-sub-${num}`);
    btn.textContent = '✓ Submitted';
    btn.disabled = true;
    btn.classList.add('done');

    const fbBtn = document.getElementById(`ex-fb-btn-${num}`);
    fbBtn.classList.add('visible');

    const badge = document.getElementById(`ex-saved-${num}`);
    badge.classList.add('visible');
}

function toggleExerciseFeedback(num) {
    const panel = document.getElementById(`ex-fb-${num}`);
    panel.classList.toggle('visible');
    const btn = document.getElementById(`ex-fb-btn-${num}`);
    btn.textContent = panel.classList.contains('visible') ? '🔽 Hide Model Answer' : '💡 View Model Answer';
}

// ===== MCQ Assessment Logic =====
function checkMCQ(exNum, qIdx, selectedIdx, correctIdx) {
    const card = document.getElementById(`mcq-${exNum}-${qIdx}`);
    // If already answered, don't allow re-answer
    if (card.classList.contains('answered')) return;

    card.classList.add('answered');
    const isCorrect = selectedIdx === correctIdx;

    // Style all options
    const options = card.querySelectorAll('.mcq-option');
    options.forEach((opt, i) => {
        opt.disabled = true;
        opt.classList.add('disabled');
        if (i === correctIdx) {
            opt.classList.add('correct');
        }
        if (i === selectedIdx && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // Show feedback
    const fb = document.getElementById(`mcq-fb-${exNum}-${qIdx}`);
    const selectedOpt = document.getElementById(`mcq-opt-${exNum}-${qIdx}-${selectedIdx}`);
    const explanation = selectedOpt.getAttribute('data-explanation');
    fb.innerHTML = `
        <div class="mcq-fb-indicator ${isCorrect ? 'mcq-fb-correct' : 'mcq-fb-incorrect'}">
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </div>
        <div class="mcq-fb-text">${explanation}</div>
    `;
    fb.classList.add('visible');

    // Update score
    updateMCQScore(exNum);

    // Save to localStorage
    saveMCQState(exNum, qIdx, selectedIdx);
}

function updateMCQScore(exNum) {
    const cards = document.querySelectorAll(`[id^="mcq-${exNum}-"].answered`);
    let correct = 0;
    cards.forEach(card => {
        if (card.querySelector('.mcq-option.correct.mcq-option:not(.incorrect)') || 
            (card.querySelector('.mcq-option.correct') && !card.querySelector('.mcq-option.incorrect'))) {
            // Check if the selected option is the correct one
            const selectedCorrect = card.querySelector('.mcq-option.correct:not(.disabled)') ||
                                     card.querySelector('.mcq-option.correct');
            const hasIncorrect = card.querySelector('.mcq-option.incorrect');
            if (!hasIncorrect) correct++;
        }
    });
    const scoreEl = document.getElementById(`mcq-score-${exNum}`);
    if (scoreEl) {
        const total = document.querySelectorAll(`[id^="mcq-${exNum}-"]:not([id*="opt"]):not([id*="fb"])`).length;
        scoreEl.textContent = `${correct} / ${total}`;
        scoreEl.classList.add('updated');
        setTimeout(() => scoreEl.classList.remove('updated'), 600);
    }
}

function saveMCQState(exNum, qIdx, selectedIdx) {
    const key = `macky_mcq_${exNum}`;
    const state = JSON.parse(localStorage.getItem(key) || '{}');
    state[qIdx] = selectedIdx;
    localStorage.setItem(key, JSON.stringify(state));
}

function restoreMCQStates() {
    for (let exNum = 1; exNum <= 5; exNum++) {
        const key = `macky_mcq_${exNum}`;
        const state = JSON.parse(localStorage.getItem(key) || '{}');
        Object.keys(state).forEach(qIdx => {
            const selectedIdx = state[qIdx];
            const card = document.getElementById(`mcq-${exNum}-${qIdx}`);
            if (!card) return;
            // Find the correct answer index from the button
            const options = card.querySelectorAll('.mcq-option');
            let correctIdx = -1;
            // Re-derive correctIdx: we need to simulate the click
            // Get all mcq data from exercises - just trigger the visual state
            const onclick = options[selectedIdx]?.getAttribute('onclick');
            if (onclick) {
                const match = onclick.match(/checkMCQ\(\d+,\s*(\d+),\s*(\d+),\s*(\d+)\)/);
                if (match) {
                    correctIdx = parseInt(match[3]);
                    card.classList.add('answered');
                    const isCorrect = selectedIdx === correctIdx;
                    options.forEach((opt, i) => {
                        opt.disabled = true;
                        opt.classList.add('disabled');
                        if (i === correctIdx) opt.classList.add('correct');
                        if (i === selectedIdx && !isCorrect) opt.classList.add('incorrect');
                    });
                    const fb = document.getElementById(`mcq-fb-${exNum}-${qIdx}`);
                    const explanation = options[selectedIdx].getAttribute('data-explanation');
                    fb.innerHTML = `
                        <div class="mcq-fb-indicator ${isCorrect ? 'mcq-fb-correct' : 'mcq-fb-incorrect'}">
                            ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                        </div>
                        <div class="mcq-fb-text">${explanation}</div>
                    `;
                    fb.classList.add('visible');
                }
            }
        });
        updateMCQScore(exNum);
    }
}

// ===== CHART BUILDER =====
let cbChart = null;

function renderChartBuilder() {
    // No-op; chart builder is controlled by dropdown events
}

function onDatasetChange() {
    updateChartBuilder();
}

function getChartBuilderData(datasetId) {
    const m1 = D.module1, m2 = D.module2, m3 = D.module3, m4 = D.module4;
    const eng = D.engagement, rest = D.restaurant;
    const palette = [
        COLORS.orange, COLORS.purple, COLORS.teal, COLORS.rose, COLORS.blue,
        COLORS.orangeLight, COLORS.purpleDark, COLORS.tealDark, '#60a5fa', '#fb7185',
        '#fbbf24', '#34d399', '#f472b6', '#818cf8'
    ];

    switch (datasetId) {
        case 'headcount_by_job': {
            const labels = Object.keys(m1.jobCounts).sort((a,b) => m1.jobCounts[b] - m1.jobCounts[a]);
            return { labels, datasets: [{ label: 'Headcount', data: labels.map(l => m1.jobCounts[l]), backgroundColor: palette }],
                title: 'Headcount by Job Role', insight: `Wait staff (${m1.jobCounts['Wait staff'].toLocaleString()}) dominate the workforce at ${(m1.jobCounts['Wait staff']/m1.totalHeadcount*100).toFixed(1)}% of total headcount.` };
        }
        case 'headcount_by_age': {
            const labels = Object.keys(m1.ageBrackets);
            return { labels, datasets: [{ label: 'Employees', data: labels.map(l => m1.ageBrackets[l]), backgroundColor: palette }],
                title: 'Headcount by Age Bracket', insight: `The workforce skews very young — ${(m1.ageBrackets['18-25']/m1.totalHeadcount*100).toFixed(1)}% are 18-25 years old.` };
        }
        case 'gender_breakdown': {
            return { labels: ['Female', 'Male'], datasets: [{ data: [m1.genderCounts.Female, m1.genderCounts.Male], backgroundColor: [COLORS.rose, COLORS.blue] }],
                title: 'Gender Breakdown', insight: `Females represent ${(m1.genderCounts.Female/m1.totalHeadcount*100).toFixed(1)}% of the total workforce.` };
        }
        case 'race_breakdown': {
            return { labels: ['White', 'URM'], datasets: [{ data: [m1.raceCounts.White, m1.raceCounts.URM], backgroundColor: [COLORS.purple, COLORS.orange] }],
                title: 'Race Breakdown', insight: `URM employees represent ${(m1.raceCounts.URM/m1.totalHeadcount*100).toFixed(1)}% of the workforce.` };
        }
        case 'market_breakdown': {
            return { labels: ['Large Market', 'Medium Market'], datasets: [{ data: [m1.marketCounts.Large, m1.marketCounts.Medium], backgroundColor: [COLORS.teal, COLORS.orange] }],
                title: 'Market Breakdown', insight: `The workforce is almost evenly split: ${m1.marketCounts.Large.toLocaleString()} in Large vs. ${m1.marketCounts.Medium.toLocaleString()} in Medium markets.` };
        }
        case 'recruit_by_source': {
            const labels = Object.keys(m1.recruitmentCounts).sort((a,b) => m1.recruitmentCounts[b] - m1.recruitmentCounts[a]);
            return { labels, datasets: [{ label: 'Hires', data: labels.map(l => m1.recruitmentCounts[l]), backgroundColor: palette }],
                title: 'Recruitment by Source', insight: `On-line Advertisement and Employee Reference are the top sources at ${m1.recruitmentCounts['On-line Advertisement'].toLocaleString()} and ${m1.recruitmentCounts['Employee Reference'].toLocaleString()} hires respectively.` };
        }
        case 'mgr_perf_by_recruit': {
            const d = m1.avgPerfByRecruitMgr;
            const labels = Object.keys(d).sort((a,b) => d[b] - d[a]);
            return { labels, datasets: [{ label: 'Avg Performance', data: labels.map(l => d[l]),
                backgroundColor: labels.map((l,i) => d[l] >= 4.25 ? COLORS.teal : d[l] >= 3.8 ? COLORS.orange : COLORS.rose) }],
                title: 'Avg Manager Performance by Recruitment Source', insight: `Marquis University tops at ${d['Marquis University']} avg, while National University is lowest at ${d['National University']}.` };
        }
        case 'turnover_by_year': {
            const years = Object.keys(m2.turnoverByYear).sort();
            return { labels: years, datasets: [
                { label: 'Quit', data: years.map(y => m2.turnoverByYear[y].quit), backgroundColor: COLORS.orange, borderColor: COLORS.orange },
                { label: 'Discharged', data: years.map(y => m2.turnoverByYear[y].discharged), backgroundColor: COLORS.rose, borderColor: COLORS.rose }
            ], title: 'Turnover by Year', insight: `Quit separations have declined slightly from ${m2.turnoverByYear['2020'].quit.toLocaleString()} (2020) to ${m2.turnoverByYear['2026'].quit.toLocaleString()} (2026).` };
        }
        case 'turnover_by_job': {
            const jobs = Object.keys(m2.turnoverByJob).sort((a,b) => (m2.turnoverByJob[b].quit+m2.turnoverByJob[b].discharged) - (m2.turnoverByJob[a].quit+m2.turnoverByJob[a].discharged));
            return { labels: jobs, datasets: [
                { label: 'Quit', data: jobs.map(j => m2.turnoverByJob[j].quit), backgroundColor: COLORS.orange },
                { label: 'Discharged', data: jobs.map(j => m2.turnoverByJob[j].discharged), backgroundColor: COLORS.rose },
                { label: 'Still Employed', data: jobs.map(j => m2.turnoverByJob[j].employed), backgroundColor: COLORS.teal }
            ], title: 'Turnover by Job Role', insight: `Wait staff have the highest absolute turnover at ${(m2.turnoverByJob['Wait staff'].quit + m2.turnoverByJob['Wait staff'].discharged).toLocaleString()} total separations.` };
        }
        case 'hire_rate_by_race': {
            const wRate = (m3.hireByRace.White.hired / m3.hireByRace.White.total * 100).toFixed(2);
            const uRate = (m3.hireByRace.URM.hired / m3.hireByRace.URM.total * 100).toFixed(2);
            return { labels: ['White', 'URM'], datasets: [{ label: 'Hire Rate (%)', data: [parseFloat(wRate), parseFloat(uRate)], backgroundColor: [COLORS.purple, COLORS.orange] }],
                title: 'Hire Rate by Race', insight: `Impact ratio: ${(uRate/wRate).toFixed(3)} — below 0.80 threshold indicates adverse impact. White: ${wRate}%, URM: ${uRate}%.` };
        }
        case 'interview_scores': {
            const ai = m3.avgInterviews;
            return { labels: ['White Hired', 'URM Hired', 'White Not Hired', 'URM Not Hired'], datasets: [
                { label: 'Interview 1', data: [ai.White_Hired.avgInterview1, ai.URM_Hired.avgInterview1, ai['White_Not hired'].avgInterview1, ai['URM_Not hired'].avgInterview1], backgroundColor: COLORS.purple },
                { label: 'Interview 2', data: [ai.White_Hired.avgInterview2, ai.URM_Hired.avgInterview2, ai['White_Not hired'].avgInterview2, ai['URM_Not hired'].avgInterview2], backgroundColor: COLORS.orange }
            ], title: 'Average Interview Scores by Group', insight: `URM applicants receive systematically lower scores in both interviews — even among those hired (5.59 vs 5.91).` };
        }
        case 'diversity_by_job': {
            const cd = m3.currentDiversity;
            const jobs = Object.keys(cd).sort((a,b) => (cd[b].White+cd[b].URM) - (cd[a].White+cd[a].URM));
            return { labels: jobs, datasets: [
                { label: 'White', data: jobs.map(j => cd[j].White), backgroundColor: COLORS.purple },
                { label: 'URM', data: jobs.map(j => cd[j].URM), backgroundColor: COLORS.orange }
            ], title: 'Current Workforce Diversity by Job', insight: `URM representation is highest in Wait staff (${(cd['Wait staff'].URM/(cd['Wait staff'].White+cd['Wait staff'].URM)*100).toFixed(1)}%) and lowest in Lead cook (${(cd['Lead cook'].URM/(cd['Lead cook'].White+cd['Lead cook'].URM)*100).toFixed(1)}%).` };
        }
        case 'wage_by_performance': {
            const wp = m4.avgWageByPerf;
            const labels = Object.keys(wp).sort();
            return { labels: labels.map(l => 'Rating ' + l), datasets: [{ label: 'Avg Wage ($)', data: labels.map(l => wp[l].avg),
                backgroundColor: labels.map(l => l === '5' ? COLORS.teal : l === '1' ? COLORS.rose : COLORS.blue) }],
                title: 'Avg Wage by Performance Rating', insight: `Top performers (Rating 5) earn $${wp['5'].avg.toLocaleString()} avg — ${((wp['5'].avg - wp['1'].avg)/wp['1'].avg*100).toFixed(1)}% more than Rating 1.` };
        }
        case 'wage_by_experience': {
            const we = m4.avgWageByExp;
            const labels = Object.keys(we).filter(k => we[k].count > 0);
            return { labels: labels.map(l => l + ' yrs'), datasets: [{ label: 'Avg Wage ($)', data: labels.map(l => we[l].avg), backgroundColor: COLORS.purple, borderColor: COLORS.purple }],
                title: 'Avg Wage by Prior Experience', insight: `Interestingly, managers with 0 years experience earn the highest avg wage ($${we['0'].avg.toLocaleString()}).` };
        }
        case 'perf_by_experience': {
            const pe = m4.avgPerfByExp;
            const labels = Object.keys(pe);
            return { labels: labels.map(l => l + ' yrs'), datasets: [{ label: 'Avg Performance', data: labels.map(l => pe[l]), backgroundColor: COLORS.teal, borderColor: COLORS.teal }],
                title: 'Avg Performance by Prior Experience', insight: `Performance is essentially flat across experience levels (~3.8), suggesting experience is a poor predictor of success.` };
        }
        case 'engagement_company': {
            const ca = eng.companyAvg;
            const dims = Object.keys(ca);
            return { labels: dims.map(d => d.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())), datasets: [{ label: 'Company Avg', data: dims.map(d => ca[d]),
                backgroundColor: COLORS.purple, borderColor: COLORS.purple, fill: true, pointBackgroundColor: COLORS.purple }],
                title: 'Company Average Engagement',
                insight: `Job Satisfaction is the highest engagement dimension at ${ca.jobSatisfaction}, while Support is lowest at ${ca.support}.` };
        }
        case 'engagement_by_market': {
            const em = eng.engByMarket;
            const dims = Object.keys(em.Large);
            return { labels: dims.map(d => d.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())), datasets: [
                { label: 'Large Market', data: dims.map(d => em.Large[d]), backgroundColor: 'rgba(45,212,191,0.15)', borderColor: COLORS.teal, fill: true },
                { label: 'Medium Market', data: dims.map(d => em.Medium[d]), backgroundColor: 'rgba(249,115,22,0.15)', borderColor: COLORS.orange, fill: true }
            ], title: 'Engagement by Market Type',
                insight: `Large Market units score higher on most engagement dimensions, but Job Satisfaction is tied at 4.32.` };
        }
        case 'engagement_exempt': {
            const ec = eng.engByCategory;
            const dims = Object.keys(ec.Exempt);
            return { labels: dims.map(d => d.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())), datasets: [
                { label: 'Exempt', data: dims.map(d => ec.Exempt[d]), backgroundColor: 'rgba(167,139,250,0.15)', borderColor: COLORS.purple, fill: true },
                { label: 'Non-Exempt', data: dims.map(d => ec['Non-Exempt'][d]), backgroundColor: 'rgba(249,115,22,0.15)', borderColor: COLORS.orange, fill: true }
            ], title: 'Engagement: Exempt vs. Non-Exempt',
                insight: `Exempt employees score higher across all dimensions. The largest gap is in Job Satisfaction (${ec.Exempt.jobSatisfaction} vs ${ec['Non-Exempt'].jobSatisfaction}).` };
        }
        case 'profit_by_unit': {
            const perf = rest.performanceByUnit2026;
            const units = Object.keys(perf).sort((a,b) => perf[b].profit - perf[a].profit);
            return { labels: units.map(u => 'Unit ' + u), datasets: [{ label: 'Profit ($)',
                data: units.map(u => perf[u].profit),
                backgroundColor: units.map(u => perf[u].market === 'Large' ? COLORS.teal : COLORS.orange) }],
                title: 'Restaurant Profit by Unit (2026)', insight: `Unit ${units[0]} leads with $${perf[units[0]].profit.toLocaleString()} profit. Large markets (teal) vs. Medium (orange).` };
        }
        case 'sales_vs_profit': {
            const perf = rest.performanceByUnit2026;
            const pts = Object.values(perf);
            return { labels: [], datasets: [
                { label: 'Large Market', data: pts.filter(p => p.market === 'Large').map(p => ({x: p.sales, y: p.profit})), backgroundColor: COLORS.teal, pointRadius: 5 },
                { label: 'Medium Market', data: pts.filter(p => p.market === 'Medium').map(p => ({x: p.sales, y: p.profit})), backgroundColor: COLORS.orange, pointRadius: 5 }
            ], title: 'Sales vs. Profit by Unit (2026)', forceType: 'scatter',
                scaleLabels: { x: 'Sales ($)', y: 'Profit ($)' },
                insight: `Higher sales generally correlate with higher profit, but large variance suggests cost management matters more than revenue.` };
        }
        case 'unit_financial_breakdown': {
            const perf = rest.performanceByUnit2026;
            const units = Object.keys(perf).sort((a,b) => a - b).slice(0, 20);
            return { labels: units.map(u => 'U' + u), datasets: [
                { label: 'COGS', data: units.map(u => perf[u].cogs), backgroundColor: COLORS.rose },
                { label: 'Payroll', data: units.map(u => perf[u].payroll), backgroundColor: COLORS.orange },
                { label: 'Fixed Ops', data: units.map(u => perf[u].fixedOps), backgroundColor: COLORS.blue },
                { label: 'Profit', data: units.map(u => perf[u].profit), backgroundColor: COLORS.teal }
            ], title: 'Unit Financial Breakdown (First 20 Units, 2026)',
                insight: `Payroll is consistently the largest cost component, often exceeding COGS and Fixed Ops combined.` };
        }
        case 'scatter_exp_wage': {
            const sc = m4.scatterManagers;
            return { labels: [], datasets: [
                { label: 'Perf 5', data: sc.filter(s => s.perf === 5).map(s => ({x: s.exp, y: s.wage})), backgroundColor: COLORS.teal, pointRadius: 6 },
                { label: 'Perf 4', data: sc.filter(s => s.perf === 4).map(s => ({x: s.exp, y: s.wage})), backgroundColor: COLORS.blue, pointRadius: 6 },
                { label: 'Perf 3', data: sc.filter(s => s.perf === 3).map(s => ({x: s.exp, y: s.wage})), backgroundColor: COLORS.orange, pointRadius: 6 },
                { label: 'Perf 1–2', data: sc.filter(s => s.perf <= 2).map(s => ({x: s.exp, y: s.wage})), backgroundColor: COLORS.rose, pointRadius: 6 }
            ], title: 'Manager Scatter: Experience vs. Wage (by Performance)', forceType: 'scatter',
                scaleLabels: { x: 'Prior Experience (Years)', y: 'Annual Wage ($)' },
                insight: `No clear pattern — top performers (green) are scattered across all experience levels, demonstrating the experience-performance paradox.` };
        }
        default:
            return null;
    }
}

function updateChartBuilder() {
    const datasetId = document.getElementById('cbDataset').value;
    if (!datasetId) return;

    const result = getChartBuilderData(datasetId);
    if (!result) return;

    // Show chart area, hide empty state
    document.getElementById('cbChartWrap').style.display = 'block';
    document.getElementById('cbEmpty').style.display = 'none';
    document.getElementById('cbChartTitle').textContent = result.title;
    document.getElementById('cbChartMeta').textContent = `${result.datasets.reduce((s,d) => s + (d.data ? d.data.length : 0), 0)} data points · Source: DASHBOARD_DATA`;
    document.getElementById('cbInsight').innerHTML = result.insight ? `<strong>💡 Insight:</strong> ${result.insight}` : '';

    // Determine chart type — always respect user's dropdown selection
    let chartType = document.getElementById('cbChartType').value;
    // forceType overrides only for scatter data (requires {x,y} points)
    if (result.forceType) chartType = result.forceType;

    // Handle horizontal bar
    let indexAxis = undefined;
    if (chartType === 'horizontalBar') {
        chartType = 'bar';
        indexAxis = 'y';
    }

    // Destroy existing chart
    if (cbChart) { cbChart.destroy(); cbChart = null; }

    const ctx = document.getElementById('cbCanvas').getContext('2d');

    const config = {
        type: chartType,
        data: { labels: result.labels, datasets: result.datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: indexAxis,
            plugins: {
                legend: { display: result.datasets.length > 1, position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            let val = ctx.parsed.y !== undefined ? ctx.parsed.y : ctx.parsed;
                            if (typeof val === 'object') val = `(${val.x}, ${val.y})`;
                            else if (val > 999) val = val.toLocaleString();
                            return `${ctx.dataset.label}: ${val}`;
                        }
                    }
                }
            },
            scales: chartType === 'pie' || chartType === 'doughnut' || chartType === 'radar' ? {} : {
                x: {
                    ticks: { maxRotation: 45, font: { size: 10 } },
                    title: result.scaleLabels ? { display: true, text: result.scaleLabels.x, color: '#94a3b8' } : {}
                },
                y: {
                    beginAtZero: chartType !== 'scatter',
                    title: result.scaleLabels ? { display: true, text: result.scaleLabels.y, color: '#94a3b8' } : {},
                    ticks: { callback: (v) => v >= 1000 ? (v/1000).toFixed(0) + 'k' : v }
                }
            }
        }
    };

    // For line charts add line styling
    if (chartType === 'line') {
        config.data.datasets.forEach(ds => {
            ds.tension = 0.3;
            ds.fill = false;
            ds.pointRadius = 4;
        });
    }

    cbChart = new Chart(ctx, config);
}

// ===== EXPLORE DATA =====
let exploreState = { source: '', sortCol: -1, sortAsc: true };

function renderExploreData() {
    const container = document.getElementById('exploreContent');
    container.innerHTML = `
        <div class="explore-toolbar">
            <div class="explore-source-group">
                <label class="explore-label">📂 Data Source</label>
                <select id="exploreSource" class="explore-select" onchange="onExploreSourceChange()">
                    <option value="">Choose a dataset…</option>
                    <option value="unitRoster">Unit Roster (headcount by job)</option>
                    <option value="managers">Manager Profiles (comp & perf)</option>
                    <option value="turnover">Turnover by Unit</option>
                    <option value="engagement">Engagement by Unit</option>
                    <option value="restaurant">Restaurant Performance (2026)</option>
                </select>
            </div>
            <div class="explore-filters" id="exploreFilters"></div>
            <div class="explore-search-group">
                <input type="text" id="exploreSearch" class="explore-search" placeholder="🔍 Search across all columns…" oninput="runExploreQuery()">
            </div>
        </div>
        <div class="explore-summary" id="exploreSummary"></div>
        <div class="explore-table-wrap" id="exploreTableWrap"></div>
    `;
}

function onExploreSourceChange() {
    const source = document.getElementById('exploreSource').value;
    exploreState.source = source;
    exploreState.sortCol = -1;
    exploreState.sortAsc = true;
    document.getElementById('exploreSearch').value = '';
    buildExploreFilters(source);
    runExploreQuery();
}

function buildExploreFilters(source) {
    const box = document.getElementById('exploreFilters');
    if (!source) { box.innerHTML = ''; return; }

    let html = '';
    // Market filter — universal
    html += `<div class="explore-filter-item">
        <label>Market</label>
        <select id="ef_market" class="explore-select" onchange="runExploreQuery()">
            <option value="">All</option>
            <option value="Large">Large</option>
            <option value="Medium">Medium</option>
        </select>
    </div>`;

    if (source === 'unitRoster') {
        const jobs = Object.keys(D.module1.jobCounts).sort();
        html += `<div class="explore-filter-item">
            <label>Job Title</label>
            <select id="ef_job" class="explore-select" onchange="runExploreQuery()">
                <option value="">All Jobs</option>
                ${jobs.map(j => `<option value="${j}">${j}</option>`).join('')}
            </select>
        </div>`;
    }

    if (source === 'managers') {
        html += `<div class="explore-filter-item">
            <label>Gender</label>
            <select id="ef_gender" class="explore-select" onchange="runExploreQuery()">
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>
        </div>`;
        html += `<div class="explore-filter-item">
            <label>Race</label>
            <select id="ef_race" class="explore-select" onchange="runExploreQuery()">
                <option value="">All</option>
                <option value="White">White</option>
                <option value="URM">URM</option>
            </select>
        </div>`;
        html += `<div class="explore-filter-item">
            <label>Min Perf</label>
            <select id="ef_perf" class="explore-select" onchange="runExploreQuery()">
                <option value="">Any</option>
                <option value="5">5 only</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
            </select>
        </div>`;
    }

    box.innerHTML = html;
}

function getExploreRows(source) {
    if (source === 'unitRoster') {
        const units = D.module1.unitHeadcount;
        return Object.entries(units).map(([id, u]) => {
            const jobs = Object.entries(u.byJob).sort((a,b) => b[1]-a[1]);
            return { Unit: id, Market: u.market, Headcount: u.total, ...u.byJob };
        });
    }
    if (source === 'managers') {
        return D.module4.scatterManagers.map(m => ({
            Unit: m.unit, Market: (D.module1.unitHeadcount[m.unit]||{}).market || '—',
            Gender: m.gender, Race: m.race, Experience: m.exp + ' yr',
            Wage: m.wage, Performance: m.perf
        }));
    }
    if (source === 'turnover') {
        return Object.entries(D.module2.turnoverByUnit).map(([id, u]) => {
            const total = u.quit + u.discharged;
            const rate = u.employed > 0 ? ((total / (u.employed + total)) * 100).toFixed(1) + '%' : '—';
            return { Unit: id, Market: u.market, Employed: u.employed, Quit: u.quit, Discharged: u.discharged, 'Total Exits': total, 'Turnover Rate': rate };
        });
    }
    if (source === 'engagement') {
        return Object.entries(D.engagement.unitEngagement).map(([id, scores]) => {
            const mkt = (D.module1.unitHeadcount[id]||{}).market || '—';
            const avg = Object.values(scores).reduce((s,v) => s+v, 0) / Object.values(scores).length;
            return { Unit: id, Market: mkt, 'Job Satisfaction': scores.jobSatisfaction, Collaboration: scores.collaboration, Communication: scores.communication, Support: scores.support, 'Customer Focus': scores.customerFocus, 'Personal Growth': scores.personalGrowth, Inclusion: scores.inclusion, Empowerment: scores.empowerment, Accountability: scores.accountability, 'Avg Score': +avg.toFixed(2) };
        });
    }
    if (source === 'restaurant') {
        return Object.entries(D.restaurant.performanceByUnit2026).map(([id, u]) => {
            const margin = u.sales > 0 ? ((u.profit / u.sales) * 100).toFixed(1) + '%' : '—';
            return { Unit: id, Market: u.market, Sales: u.sales, COGS: u.cogs, Payroll: u.payroll, 'Fixed Ops': u.fixedOps, Profit: u.profit, 'Margin': margin };
        });
    }
    return [];
}

function runExploreQuery() {
    const source = exploreState.source;
    if (!source) {
        document.getElementById('exploreTableWrap').innerHTML = '<div class="explore-empty">Select a data source above to begin exploring.</div>';
        document.getElementById('exploreSummary').innerHTML = '';
        return;
    }

    let rows = getExploreRows(source);
    const cols = rows.length > 0 ? Object.keys(rows[0]) : [];

    // Apply market filter
    const mkt = document.getElementById('ef_market')?.value;
    if (mkt) rows = rows.filter(r => r.Market === mkt);

    // Apply job filter (unitRoster)
    if (source === 'unitRoster') {
        const job = document.getElementById('ef_job')?.value;
        if (job) rows = rows.filter(r => (r[job] || 0) > 0);
    }

    // Apply manager filters
    if (source === 'managers') {
        const gen = document.getElementById('ef_gender')?.value;
        const race = document.getElementById('ef_race')?.value;
        const perf = document.getElementById('ef_perf')?.value;
        if (gen) rows = rows.filter(r => r.Gender === gen);
        if (race) rows = rows.filter(r => r.Race === race);
        if (perf) rows = rows.filter(r => r.Performance >= parseInt(perf));
    }

    // Apply search
    const search = (document.getElementById('exploreSearch')?.value || '').toLowerCase();
    if (search) {
        rows = rows.filter(r => cols.some(c => String(r[c]).toLowerCase().includes(search)));
    }

    // Apply sort
    if (exploreState.sortCol >= 0 && exploreState.sortCol < cols.length) {
        const key = cols[exploreState.sortCol];
        rows.sort((a, b) => {
            let va = a[key], vb = b[key];
            // Try numeric
            const na = typeof va === 'string' ? parseFloat(va.replace(/[^0-9.-]/g, '')) : va;
            const nb = typeof vb === 'string' ? parseFloat(vb.replace(/[^0-9.-]/g, '')) : vb;
            if (!isNaN(na) && !isNaN(nb)) {
                return exploreState.sortAsc ? na - nb : nb - na;
            }
            va = String(va); vb = String(vb);
            return exploreState.sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
    }

    // Build summary
    const totalRows = getExploreRows(source).length;
    document.getElementById('exploreSummary').innerHTML = `
        <span class="explore-count">Showing <strong>${rows.length}</strong> of ${totalRows} records</span>
        <button class="explore-copy-btn" onclick="copyExploreTable()">📋 Copy to Clipboard</button>
    `;

    // Build table
    const moneyKeys = ['Wage', 'Sales', 'COGS', 'Payroll', 'Fixed Ops', 'Profit'];
    let html = '<table class="explore-table" id="exploreTable"><thead><tr>';
    cols.forEach((c, i) => {
        const arrow = exploreState.sortCol === i ? (exploreState.sortAsc ? ' ↑' : ' ↓') : '';
        html += `<th onclick="sortExploreCol(${i})">${c}${arrow}</th>`;
    });
    html += '</tr></thead><tbody>';
    if (rows.length === 0) {
        html += `<tr><td colspan="${cols.length}" class="explore-no-data">No matching records found</td></tr>`;
    }
    rows.forEach(r => {
        html += '<tr>';
        cols.forEach(c => {
            let v = r[c];
            if (moneyKeys.includes(c) && typeof v === 'number') {
                v = '$' + v.toLocaleString();
            } else if (typeof v === 'number' && !Number.isInteger(v)) {
                v = v.toFixed(2);
            } else if (typeof v === 'number') {
                v = v.toLocaleString();
            }
            html += `<td>${v !== undefined && v !== null ? v : '—'}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('exploreTableWrap').innerHTML = html;
}

function sortExploreCol(colIdx) {
    if (exploreState.sortCol === colIdx) {
        exploreState.sortAsc = !exploreState.sortAsc;
    } else {
        exploreState.sortCol = colIdx;
        exploreState.sortAsc = true;
    }
    runExploreQuery();
}

function copyExploreTable() {
    const table = document.getElementById('exploreTable');
    if (!table) return;
    const rows = [];
    table.querySelectorAll('tr').forEach(tr => {
        const cells = [];
        tr.querySelectorAll('th, td').forEach(td => cells.push(td.textContent.trim()));
        rows.push(cells.join('\t'));
    });
    navigator.clipboard.writeText(rows.join('\n')).then(() => {
        const btn = document.querySelector('.explore-copy-btn');
        if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy to Clipboard', 2000); }
    });
}

// ===== STATISTICAL ANALYSIS =====

// --- Pure-JS Statistics Engine ---
function mean(arr) { return arr.reduce((s,v) => s+v, 0) / arr.length; }
function sd(arr) { const m = mean(arr); return Math.sqrt(arr.reduce((s,v) => s + (v-m)*(v-m), 0) / arr.length); }
function stdDev(arr) {
    const m = mean(arr);
    return Math.sqrt(arr.reduce((s,v) => s + (v-m)*(v-m), 0) / (arr.length - 1));
}

// Welch's t-test (unequal variances)
function welchTTest(a, b) {
    const n1 = a.length, n2 = b.length;
    if (n1 < 2 || n2 < 2) return { t: 0, df: 0, p: 1 };
    const m1 = mean(a), m2 = mean(b);
    const v1 = stdDev(a)**2, v2 = stdDev(b)**2;
    const se = Math.sqrt(v1/n1 + v2/n2);
    if (se === 0) return { t: 0, df: n1+n2-2, p: 1 };
    const t = (m1 - m2) / se;
    const num = (v1/n1 + v2/n2)**2;
    const den = (v1/n1)**2/(n1-1) + (v2/n2)**2/(n2-1);
    const df = num / den;
    const p = 2 * (1 - tCDF(Math.abs(t), df));
    return { t, df, p };
}

function cohensD(a, b) {
    const m1 = mean(a), m2 = mean(b);
    const s1 = stdDev(a), s2 = stdDev(b);
    const pooled = Math.sqrt(((a.length-1)*s1*s1 + (b.length-1)*s2*s2) / (a.length+b.length-2));
    return pooled === 0 ? 0 : (m1 - m2) / pooled;
}

// t-distribution CDF approximation (regularized incomplete beta)
function tCDF(t, df) {
    const x = df / (df + t*t);
    return 1 - 0.5 * regIncBeta(df/2, 0.5, x);
}

function regIncBeta(a, b, x) {
    // Uses continued fraction (Lentz's method)
    if (x < 0 || x > 1) return 0;
    if (x === 0 || x === 1) return x;
    const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a+b);
    const prefix = Math.exp(Math.log(x)*a + Math.log(1-x)*b - lnBeta) / a;
    // Use continued fraction
    let num = 1, den = 1 - (a+b)*x/(a+1);
    if (Math.abs(den) < 1e-30) den = 1e-30;
    den = 1/den; let cf = den;
    for (let m = 1; m <= 200; m++) {
        // even step
        let aM = m*(b-m)*x / ((a+2*m-1)*(a+2*m));
        den = 1 + aM*den; if (Math.abs(den) < 1e-30) den = 1e-30;
        num = 1 + aM/num; if (Math.abs(num) < 1e-30) num = 1e-30;
        den = 1/den; cf *= den*num;
        // odd step
        aM = -((a+m)*(a+b+m)*x) / ((a+2*m)*(a+2*m+1));
        den = 1 + aM*den; if (Math.abs(den) < 1e-30) den = 1e-30;
        num = 1 + aM/num; if (Math.abs(num) < 1e-30) num = 1e-30;
        den = 1/den; const delta = den*num; cf *= delta;
        if (Math.abs(delta - 1) < 1e-10) break;
    }
    return prefix * cf;
}

function lnGamma(z) {
    // Lanczos approximation
    const c = [76.18009172947146,-86.50532032941677,24.01409824083091,
        -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
    let y = z, tmp = z + 5.5;
    tmp -= (z + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) ser += c[j] / ++y;
    return -tmp + Math.log(2.5066282746310005 * ser / z);
}

// --- Stats Tab UI ---
function switchStatsTab(tab, btnEl) {
    document.querySelectorAll('.stats-tab').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    document.getElementById('statsCompare').style.display = tab === 'compare' ? '' : 'none';
    document.getElementById('statsPredict').style.display = tab === 'predict' ? '' : 'none';
    document.getElementById('statsEngagement').style.display = tab === 'engagement' ? '' : 'none';
}

function renderStats() {
    renderCompareMeans();
    renderTurnoverPrediction();
    renderEngagementStats();
}

// --- Compare Means ---
const COMPARE_CONFIGS = {
    market: {
        label: 'Market (Large vs Medium)',
        groups: ['Large', 'Medium'],
        metrics: {
            'Headcount': () => { const u = D.module1.unitHeadcount; return splitByMarket(u, (id,u) => u.total); },
            'Quit Count': () => { const u = D.module2.turnoverByUnit; return splitByMarket(u, (id,u) => u.quit); },
            'Discharged Count': () => { const u = D.module2.turnoverByUnit; return splitByMarket(u, (id,u) => u.discharged); },
            'Total Turnover Count': () => { const u = D.module2.turnoverByUnit; return splitByMarket(u, (id,u) => u.quit + u.discharged); },
            'Turnover Rate (%)': () => {
                const u = D.module2.turnoverByUnit;
                return splitByMarket(u, (id,u) => {
                    const tot = u.quit+u.discharged;
                    return u.employed > 0 ? tot/(u.employed+tot)*100 : 0;
                });
            },
            'Avg Engagement (Overall)': () => {
                const dims = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
                const large = [], medium = [];
                Object.entries(D.engagement.unitEngagement).forEach(([id, s]) => {
                    const avg = dims.reduce((sum,d) => sum+s[d], 0) / dims.length;
                    const mkt = (D.module1.unitHeadcount[id]||{}).market;
                    if (mkt === 'Large') large.push(avg); else medium.push(avg);
                });
                return [large, medium];
            },
            'Job Satisfaction': () => engagementByMarket('jobSatisfaction'),
            'Collaboration': () => engagementByMarket('collaboration'),
            'Communication': () => engagementByMarket('communication'),
            'Support': () => engagementByMarket('support'),
            'Customer Focus': () => engagementByMarket('customerFocus'),
            'Personal Growth': () => engagementByMarket('personalGrowth'),
            'Inclusion': () => engagementByMarket('inclusion'),
            'Empowerment': () => engagementByMarket('empowerment'),
            'Accountability': () => engagementByMarket('accountability'),
            'Sales ($)': () => restByMarket('sales'),
            'COGS ($)': () => restByMarket('cogs'),
            'Payroll ($)': () => restByMarket('payroll'),
            'Fixed Ops ($)': () => restByMarket('fixedOps'),
            'Profit ($)': () => restByMarket('profit'),
            'Profit Margin (%)': () => {
                const large = [], medium = [];
                Object.entries(D.restaurant.performanceByUnit2026).forEach(([id, u]) => {
                    const margin = u.sales > 0 ? (u.profit / u.sales) * 100 : 0;
                    if (u.market === 'Large') large.push(margin); else medium.push(margin);
                });
                return [large, medium];
            },
            'Flight Risk Employees': () => {
                const large = [], medium = [];
                Object.entries(D.module2.flightRiskUnits).forEach(([id, u]) => {
                    if (u.market === 'Large') large.push(u.declining); else medium.push(u.declining);
                });
                return [large, medium];
            },
        }
    },
    gender: {
        label: 'Gender (Male vs Female)',
        groups: ['Male', 'Female'],
        metrics: {
            'Manager Wage ($)': () => splitManagers('gender', 'Male', 'Female', m => m.wage),
            'Hourly Wage ($)': () => splitManagers('gender', 'Male', 'Female', m => +(m.wage / 2080).toFixed(2)),
            'Performance Rating': () => splitManagers('gender', 'Male', 'Female', m => m.perf),
            'Experience (yrs)': () => splitManagers('gender', 'Male', 'Female', m => m.exp),
            'Workforce Count': () => [[D.module1.genderCounts.Male], [D.module1.genderCounts.Female]],
            'Hiring Rate (%)': () => {
                const m = D.module3.hireByGender.Male, f = D.module3.hireByGender.Female;
                return [[m.total > 0 ? (m.hired/m.total)*100 : 0], [f.total > 0 ? (f.hired/f.total)*100 : 0]];
            },
            'Engagement — Job Satisfaction': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Men', 'jobSatisfaction'), engCatToArray(c, 'Women', 'jobSatisfaction')];
            },
            'Engagement — Collaboration': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Men', 'collaboration'), engCatToArray(c, 'Women', 'collaboration')];
            },
            'Engagement — Customer Focus': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Men', 'customerFocus'), engCatToArray(c, 'Women', 'customerFocus')];
            },
            'Engagement — Empowerment': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Men', 'empowerment'), engCatToArray(c, 'Women', 'empowerment')];
            },
        }
    },
    race: {
        label: 'Race (White vs URM)',
        groups: ['White', 'URM'],
        metrics: {
            'Manager Wage ($)': () => splitManagers('race', 'White', 'URM', m => m.wage),
            'Hourly Wage ($)': () => splitManagers('race', 'White', 'URM', m => +(m.wage / 2080).toFixed(2)),
            'Performance Rating': () => splitManagers('race', 'White', 'URM', m => m.perf),
            'Experience (yrs)': () => splitManagers('race', 'White', 'URM', m => m.exp),
            'Workforce Count': () => [[D.module1.raceCounts.White], [D.module1.raceCounts.URM]],
            'Hiring Rate (%)': () => {
                const w = D.module3.hireByRace.White, u = D.module3.hireByRace.URM;
                return [[w.total > 0 ? (w.hired/w.total)*100 : 0], [u.total > 0 ? (u.hired/u.total)*100 : 0]];
            },
            'Interview 1 Score (Hired)': () => {
                const w = D.module3.avgInterviews.White_Hired, u = D.module3.avgInterviews.URM_Hired;
                return [Array(w.count).fill(w.avgInterview1), Array(u.count).fill(u.avgInterview1)];
            },
            'Interview 1 Score (Not Hired)': () => {
                const w = D.module3.avgInterviews.White_Not_hired || D.module3.avgInterviews['White_Not hired'];
                const u = D.module3.avgInterviews.URM_Not_hired || D.module3.avgInterviews['URM_Not hired'];
                return [Array(w.count).fill(w.avgInterview1), Array(u.count).fill(u.avgInterview1)];
            },
            'Engagement — Job Satisfaction': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'White', 'jobSatisfaction'), engCatToArray(c, 'URM', 'jobSatisfaction')];
            },
            'Engagement — Collaboration': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'White', 'collaboration'), engCatToArray(c, 'URM', 'collaboration')];
            },
            'Engagement — Customer Focus': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'White', 'customerFocus'), engCatToArray(c, 'URM', 'customerFocus')];
            },
        }
    },
    performance: {
        label: 'Performance (High ≥4 vs Low ≤3)',
        groups: ['High (≥4)', 'Low (≤3)'],
        metrics: {
            'Manager Wage ($)': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => m.wage);
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => m.wage);
                return [hi, lo];
            },
            'Hourly Wage ($)': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => +(m.wage / 2080).toFixed(2));
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => +(m.wage / 2080).toFixed(2));
                return [hi, lo];
            },
            'Experience (yrs)': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => m.exp);
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => m.exp);
                return [hi, lo];
            },
            'Unit Headcount': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => (D.module1.unitHeadcount[m.unit]||{}).total||0);
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => (D.module1.unitHeadcount[m.unit]||{}).total||0);
                return [hi, lo];
            },
            'Unit Profit ($)': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => (D.restaurant.performanceByUnit2026[m.unit]||{}).profit||0);
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => (D.restaurant.performanceByUnit2026[m.unit]||{}).profit||0);
                return [hi, lo];
            },
            'Unit Sales ($)': () => {
                const hi = D.module4.scatterManagers.filter(m => m.perf >= 4).map(m => (D.restaurant.performanceByUnit2026[m.unit]||{}).sales||0);
                const lo = D.module4.scatterManagers.filter(m => m.perf <= 3).map(m => (D.restaurant.performanceByUnit2026[m.unit]||{}).sales||0);
                return [hi, lo];
            },
        }
    },
    exempt: {
        label: 'Exempt vs Non-Exempt',
        groups: ['Exempt', 'Non-Exempt'],
        metrics: {
            'Engagement — Job Satisfaction': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'jobSatisfaction'), engCatToArray(c, 'Non-Exempt', 'jobSatisfaction')];
            },
            'Engagement — Collaboration': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'collaboration'), engCatToArray(c, 'Non-Exempt', 'collaboration')];
            },
            'Engagement — Communication': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'communication'), engCatToArray(c, 'Non-Exempt', 'communication')];
            },
            'Engagement — Support': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'support'), engCatToArray(c, 'Non-Exempt', 'support')];
            },
            'Engagement — Customer Focus': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'customerFocus'), engCatToArray(c, 'Non-Exempt', 'customerFocus')];
            },
            'Engagement — Personal Growth': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'personalGrowth'), engCatToArray(c, 'Non-Exempt', 'personalGrowth')];
            },
            'Engagement — Inclusion': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'inclusion'), engCatToArray(c, 'Non-Exempt', 'inclusion')];
            },
            'Engagement — Empowerment': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'empowerment'), engCatToArray(c, 'Non-Exempt', 'empowerment')];
            },
            'Engagement — Accountability': () => {
                const c = D.engagement.engByCategory;
                return [engCatToArray(c, 'Exempt', 'accountability'), engCatToArray(c, 'Non-Exempt', 'accountability')];
            },
            'Workforce Count': () => [[D.module1.exemptCounts.Exempt], [D.module1.exemptCounts['Non-Exempt']]],
        }
    },
    profitable: {
        label: 'Profitable vs Unprofitable Units',
        groups: ['Profitable', 'Unprofitable'],
        metrics: {
            'Headcount': () => splitByProfit((id,u) => (D.module1.unitHeadcount[id]||{}).total||0),
            'Turnover Rate (%)': () => {
                return splitByProfit((id) => {
                    const u = D.module2.turnoverByUnit[id];
                    if (!u) return null;
                    const tot = u.quit+u.discharged;
                    return u.employed > 0 ? tot/(u.employed+tot)*100 : 0;
                });
            },
            'Avg Engagement (Overall)': () => {
                const dims = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
                return splitByProfit((id) => {
                    const s = D.engagement.unitEngagement[id];
                    return s ? dims.reduce((sum,d) => sum + s[d], 0) / dims.length : null;
                });
            },
            'Job Satisfaction': () => splitByProfit((id) => (D.engagement.unitEngagement[id]||{}).jobSatisfaction),
            'Collaboration': () => splitByProfit((id) => (D.engagement.unitEngagement[id]||{}).collaboration),
            'Communication': () => splitByProfit((id) => (D.engagement.unitEngagement[id]||{}).communication),
            'Customer Focus': () => splitByProfit((id) => (D.engagement.unitEngagement[id]||{}).customerFocus),
            'Empowerment': () => splitByProfit((id) => (D.engagement.unitEngagement[id]||{}).empowerment),
            'Sales ($)': () => splitByProfit((id,u) => u.sales),
            'Payroll ($)': () => splitByProfit((id,u) => u.payroll),
            'COGS ($)': () => splitByProfit((id,u) => u.cogs),
            'Profit Margin (%)': () => splitByProfit((id,u) => u.sales > 0 ? (u.profit/u.sales)*100 : 0),
        }
    },
    highEngagement: {
        label: 'High vs Low Engagement Units',
        groups: ['High Engagement', 'Low Engagement'],
        metrics: {
            'Turnover Rate (%)': () => splitByEngagement((id) => {
                const u = D.module2.turnoverByUnit[id];
                if (!u) return null;
                const tot = u.quit+u.discharged;
                return u.employed > 0 ? tot/(u.employed+tot)*100 : 0;
            }),
            'Headcount': () => splitByEngagement((id) => (D.module1.unitHeadcount[id]||{}).total||0),
            'Profit ($)': () => splitByEngagement((id) => (D.restaurant.performanceByUnit2026[id]||{}).profit||0),
            'Sales ($)': () => splitByEngagement((id) => (D.restaurant.performanceByUnit2026[id]||{}).sales||0),
            'Profit Margin (%)': () => splitByEngagement((id) => {
                const u = D.restaurant.performanceByUnit2026[id];
                return u && u.sales > 0 ? (u.profit/u.sales)*100 : 0;
            }),
            'Flight Risk Employees': () => splitByEngagement((id) => (D.module2.flightRiskUnits[id]||{}).declining||0),
            'Quit Count': () => splitByEngagement((id) => (D.module2.turnoverByUnit[id]||{}).quit||0),
        }
    }
};

/* Helper: create an array from engagement-by-category aggregate data for t-test */
function engCatToArray(cats, catKey, dim) {
    const val = cats[catKey] ? cats[catKey][dim] : null;
    // Use simulated samples around the mean for aggregate data to enable t-test
    if (val == null) return [];
    // We only have aggregate means, so we return a single-value array
    // This works for display but t-test needs n≥2; use multiple samples from unit-level where possible
    return [val];
}

function splitByMarket(units, valueFn) {
    const large = [], medium = [];
    Object.entries(units).forEach(([id, u]) => {
        const mkt = u.market || (D.module1.unitHeadcount[id]||{}).market;
        const v = valueFn(id, u);
        if (mkt === 'Large') large.push(v); else medium.push(v);
    });
    return [large, medium];
}

function engagementByMarket(dim) {
    const large = [], medium = [];
    Object.entries(D.engagement.unitEngagement).forEach(([id, scores]) => {
        const mkt = (D.module1.unitHeadcount[id]||{}).market;
        if (mkt === 'Large') large.push(scores[dim]); else medium.push(scores[dim]);
    });
    return [large, medium];
}

function restByMarket(field) {
    const large = [], medium = [];
    Object.entries(D.restaurant.performanceByUnit2026).forEach(([id, u]) => {
        if (u.market === 'Large') large.push(u[field]); else medium.push(u[field]);
    });
    return [large, medium];
}

function splitManagers(field, val1, val2, valueFn) {
    const g1 = D.module4.scatterManagers.filter(m => m[field] === val1).map(valueFn);
    const g2 = D.module4.scatterManagers.filter(m => m[field] === val2).map(valueFn);
    return [g1, g2];
}

/* Helper: split units by profitability (profit > median = profitable) */
function splitByProfit(valueFn) {
    const profitEntries = Object.entries(D.restaurant.performanceByUnit2026);
    const profits = profitEntries.map(([,u]) => u.profit).sort((a,b) => a - b);
    const medianProfit = profits[Math.floor(profits.length / 2)];
    const profitable = [], unprofitable = [];
    profitEntries.forEach(([id, u]) => {
        const v = valueFn(id, u);
        if (v == null) return;
        if (u.profit >= medianProfit) profitable.push(v); else unprofitable.push(v);
    });
    return [profitable, unprofitable];
}

/* Helper: split units by overall engagement (above/below median) */
function splitByEngagement(valueFn) {
    const dims = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
    const unitAvgs = {};
    Object.entries(D.engagement.unitEngagement).forEach(([id, s]) => {
        unitAvgs[id] = dims.reduce((sum,d) => sum + s[d], 0) / dims.length;
    });
    const avgs = Object.values(unitAvgs).sort((a,b) => a - b);
    const medianEng = avgs[Math.floor(avgs.length / 2)];
    const high = [], low = [];
    Object.keys(unitAvgs).forEach(id => {
        const v = valueFn(id);
        if (v == null) return;
        if (unitAvgs[id] >= medianEng) high.push(v); else low.push(v);
    });
    return [high, low];
}

function renderCompareMeans() {
    const container = document.getElementById('statsCompare');
    let groupOpts = Object.entries(COMPARE_CONFIGS).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join('');
    container.innerHTML = `
        <div class="stats-controls">
            <div class="stats-control-group">
                <label class="stats-ctrl-label">👥 Grouping Variable</label>
                <select id="statsGrouping" class="stats-select" onchange="onStatsGroupChange()">
                    ${groupOpts}
                </select>
            </div>
            <div class="stats-control-group">
                <label class="stats-ctrl-label">📊 Metric to Compare</label>
                <select id="statsMetric" class="stats-select" onchange="runCompareMeans()">
                </select>
            </div>
            <button class="stats-run-btn" onclick="runCompareMeans()">Run t-Test</button>
        </div>
        <div id="statsResults"></div>
    `;
    onStatsGroupChange();
}

function onStatsGroupChange() {
    const gKey = document.getElementById('statsGrouping').value;
    const cfg = COMPARE_CONFIGS[gKey];
    const metricSel = document.getElementById('statsMetric');
    metricSel.innerHTML = Object.keys(cfg.metrics).map(m => `<option value="${m}">${m}</option>`).join('');
    runCompareMeans();
}

function runCompareMeans() {
    const gKey = document.getElementById('statsGrouping').value;
    const metricKey = document.getElementById('statsMetric').value;
    const cfg = COMPARE_CONFIGS[gKey];
    const [g1, g2] = cfg.metrics[metricKey]();
    const groupLabels = cfg.groups;

    if (g1.length < 2 || g2.length < 2) {
        document.getElementById('statsResults').innerHTML = '<div class="stats-no-data">Not enough data for this comparison (need at least 2 per group).</div>';
        return;
    }

    const m1 = mean(g1), m2 = mean(g2);
    const sd1 = stdDev(g1), sd2 = stdDev(g2);
    const test = welchTTest(g1, g2);
    const d = cohensD(g1, g2);
    const sig = test.p < 0.05;
    const sigLabel = sig ? 'Statistically Significant' : 'Not Significant';
    const sigClass = sig ? 'stats-sig-yes' : 'stats-sig-no';

    // Effect size label
    const absD = Math.abs(d);
    let effectLabel = 'Negligible';
    if (absD >= 0.8) effectLabel = 'Large';
    else if (absD >= 0.5) effectLabel = 'Medium';
    else if (absD >= 0.2) effectLabel = 'Small';

    const pDisplay = test.p < 0.001 ? '< 0.001' : test.p.toFixed(4);

    const fmtVal = (v) => {
        if (metricKey.includes('$')) return '$' + v.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        if (metricKey.includes('Rate')) return v.toFixed(2) + '%';
        return v.toFixed(2);
    };

    document.getElementById('statsResults').innerHTML = `
        <div class="stats-results-grid">
            <div class="stats-result-card">
                <div class="stats-card-header">${groupLabels[0]}</div>
                <div class="stats-card-body">
                    <div class="stats-stat-row"><span>n</span><strong>${g1.length}</strong></div>
                    <div class="stats-stat-row"><span>Mean</span><strong>${fmtVal(m1)}</strong></div>
                    <div class="stats-stat-row"><span>SD</span><strong>${fmtVal(sd1)}</strong></div>
                </div>
            </div>
            <div class="stats-result-card stats-vs-card">
                <div class="stats-vs">VS</div>
                <div class="stats-badge ${sigClass}">${sigLabel}</div>
            </div>
            <div class="stats-result-card">
                <div class="stats-card-header">${groupLabels[1]}</div>
                <div class="stats-card-body">
                    <div class="stats-stat-row"><span>n</span><strong>${g2.length}</strong></div>
                    <div class="stats-stat-row"><span>Mean</span><strong>${fmtVal(m2)}</strong></div>
                    <div class="stats-stat-row"><span>SD</span><strong>${fmtVal(sd2)}</strong></div>
                </div>
            </div>
        </div>
        <div class="stats-test-summary">
            <div class="stats-test-item"><span>t-statistic</span><strong>${test.t.toFixed(4)}</strong></div>
            <div class="stats-test-item"><span>Degrees of freedom</span><strong>${test.df.toFixed(1)}</strong></div>
            <div class="stats-test-item"><span>p-value</span><strong class="${sigClass}">${pDisplay}</strong></div>
            <div class="stats-test-item"><span>Cohen's d</span><strong>${d.toFixed(3)} (${effectLabel})</strong></div>
            <div class="stats-test-item"><span>Mean difference</span><strong>${fmtVal(m1 - m2)}</strong></div>
        </div>
        <div class="stats-interpretation">
            <h4>📝 Interpretation</h4>
            <p>${sig
                ? `The difference in <strong>${metricKey}</strong> between <strong>${groupLabels[0]}</strong> (M = ${fmtVal(m1)}) and <strong>${groupLabels[1]}</strong> (M = ${fmtVal(m2)}) is <strong>statistically significant</strong> at the α = 0.05 level, t(${test.df.toFixed(1)}) = ${test.t.toFixed(2)}, p = ${pDisplay}. The effect size is ${effectLabel.toLowerCase()} (d = ${d.toFixed(2)}).`
                : `The difference in <strong>${metricKey}</strong> between <strong>${groupLabels[0]}</strong> (M = ${fmtVal(m1)}) and <strong>${groupLabels[1]}</strong> (M = ${fmtVal(m2)}) is <strong>not statistically significant</strong> at the α = 0.05 level, t(${test.df.toFixed(1)}) = ${test.t.toFixed(2)}, p = ${pDisplay}. The effect size is ${effectLabel.toLowerCase()} (d = ${d.toFixed(2)}).`
            }</p>
        </div>
        <div class="stats-chart-wrap" style="position:relative;height:220px;">
            <canvas id="statsCompareChart"></canvas>
        </div>
    `;

    // Draw bar chart with error bars
    if (activeCharts['statsCompareChart']) activeCharts['statsCompareChart'].destroy();
    const ctx = document.getElementById('statsCompareChart');
    activeCharts['statsCompareChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: groupLabels,
            datasets: [{
                label: metricKey,
                data: [m1, m2],
                backgroundColor: ['rgba(99,102,241,0.6)', 'rgba(236,72,153,0.6)'],
                borderColor: ['#6366f1', '#ec4899'],
                borderWidth: 2,
                borderRadius: 4,
                barPercentage: 0.5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: `${metricKey}: ${groupLabels[0]} vs ${groupLabels[1]}`, color: '#e2e8f0', font: { size: 14 } },
                tooltip: {
                    callbacks: {
                        afterBody: (items) => {
                            const i = items[0].dataIndex;
                            const sd = i === 0 ? sd1 : sd2;
                            return `SD: ${fmtVal(sd)}`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(51,65,85,0.3)' } },
                x: { ticks: { color: '#e2e8f0', font: { size: 13, weight: 'bold' } }, grid: { display: false } }
            }
        },
        plugins: [{
            id: 'errorBars',
            afterDraw(chart) {
                const { ctx, scales: { x, y } } = chart;
                const sds = [sd1, sd2];
                chart.data.datasets[0].data.forEach((val, i) => {
                    const xPos = x.getPixelForValue(i);
                    const yTop = y.getPixelForValue(val + sds[i]);
                    const yBot = y.getPixelForValue(val - sds[i]);
                    ctx.save();
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(xPos, yTop); ctx.lineTo(xPos, yBot);
                    ctx.moveTo(xPos-6, yTop); ctx.lineTo(xPos+6, yTop);
                    ctx.moveTo(xPos-6, yBot); ctx.lineTo(xPos+6, yBot);
                    ctx.stroke();
                    ctx.restore();
                });
            }
        }]
    });
}

// --- Turnover Prediction ---
// --- Engagement Analysis ---
function renderEngagementStats() {
    const dims = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
    const dimLabels = { jobSatisfaction:'Job Satisfaction', collaboration:'Collaboration', communication:'Communication', support:'Support', customerFocus:'Customer Focus', personalGrowth:'Personal Growth', inclusion:'Inclusion', empowerment:'Empowerment', accountability:'Accountability' };
    const dimOpts = dims.map(d => `<option value="${d}">${dimLabels[d]}</option>`).join('');

    document.getElementById('statsEngagement').innerHTML = `
        <div class="stats-controls">
            <div class="stats-control-group">
                <label class="stats-ctrl-label">📊 Dimension</label>
                <select id="engDim" class="stats-select" onchange="runEngagementAnalysis()">
                    <option value="all">All Dimensions</option>
                    <optgroup label="Individual Dimensions">
                    ${dimOpts}
                    </optgroup>
                </select>
            </div>
            <div class="stats-control-group">
                <label class="stats-ctrl-label">🔍 Analyze By</label>
                <select id="engAnalysis" class="stats-select" onchange="runEngagementAnalysis()">
                    <option value="unit">By Unit (all units)</option>
                    <option value="market">By Market (Large vs Medium)</option>
                    <option value="exempt">By Exempt Status</option>
                    <option value="gender">By Gender (Men vs Women)</option>
                    <option value="race">By Race (White vs URM)</option>
                </select>
            </div>
            <button class="stats-run-btn" onclick="runEngagementAnalysis()">Analyze</button>
        </div>
        <div id="engResults"></div>
    `;
    runEngagementAnalysis();
}

function runEngagementAnalysis() {
    const dim = document.getElementById('engDim').value;
    const analysis = document.getElementById('engAnalysis').value;
    const dims = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
    const dimLabels = { jobSatisfaction:'Job Satisfaction', collaboration:'Collaboration', communication:'Communication', support:'Support', customerFocus:'Customer Focus', personalGrowth:'Personal Growth', inclusion:'Inclusion', empowerment:'Empowerment', accountability:'Accountability' };
    const dimLabel = dim === 'all' ? 'All Dimensions (Avg)' : dimLabels[dim];
    const isAllDims = dim === 'all';

    const ue = D.engagement.unitEngagement;
    const allUnitIds = Object.keys(ue);

    // Helper: get score for a unit — either single dim or average of all dims
    const getScore = (id) => {
        if (isAllDims) {
            return dims.reduce((sum, d) => sum + (ue[id][d] || 0), 0) / dims.length;
        }
        return ue[id][dim] || 0;
    };

    // Build arrays of scores for the selected dimension
    let group1 = [], group2 = [], g1Label = '', g2Label = '';

    if (analysis === 'unit') {
        // All units — just descriptive stats + table
        group1 = allUnitIds.map(id => getScore(id));
        g1Label = 'All Units';
    } else if (analysis === 'market') {
        allUnitIds.forEach(id => {
            const mkt = D.module1.unitHeadcount[id]?.market;
            if (mkt === 'Large') group1.push(getScore(id));
            else group2.push(getScore(id));
        });
        g1Label = 'Large Market'; g2Label = 'Medium Market';
    } else if (analysis === 'exempt') {
        const ec = D.engagement.engByCategory;
        if (ec.Exempt && ec['Non-Exempt']) {
            group1 = dims.map(d => ec.Exempt[d] || 0);
            group2 = dims.map(d => ec['Non-Exempt'][d] || 0);
        }
        g1Label = 'Exempt'; g2Label = 'Non-Exempt';
    } else if (analysis === 'gender') {
        const ec = D.engagement.engByCategory;
        if (ec.Men && ec.Women) {
            group1 = dims.map(d => ec.Men[d] || 0);
            group2 = dims.map(d => ec.Women[d] || 0);
        }
        g1Label = 'Men'; g2Label = 'Women';
    } else if (analysis === 'race') {
        const ec = D.engagement.engByCategory;
        if (ec.White && ec.URM) {
            group1 = dims.map(d => ec.White[d] || 0);
            group2 = dims.map(d => ec.URM[d] || 0);
        }
        g1Label = 'White'; g2Label = 'URM';
    }

    // Descriptive stats function
    const desc = (arr) => {
        if (!arr.length) return { n:0, mean:0, sd:0, min:0, max:0, range:0, cv:0 };
        const m = mean(arr);
        const s = sd(arr);
        return { n: arr.length, mean: m, sd: s, min: Math.min(...arr), max: Math.max(...arr), range: Math.max(...arr) - Math.min(...arr), cv: m > 0 ? (s/m*100) : 0 };
    };

    let html = '';

    if (analysis === 'unit') {
        // Full unit distribution for selected dimension
        const stats = desc(group1);
        const unitData = allUnitIds.map(id => ({ id, score: getScore(id), market: D.module1.unitHeadcount[id]?.market || '?' })).sort((a,b) => b.score - a.score);

        // Company average for display
        const compAvgDisplay = isAllDims
            ? (dims.reduce((sum, d) => sum + (D.engagement.companyAvg[d] || 0), 0) / dims.length).toFixed(3)
            : (D.engagement.companyAvg[dim] || 0).toFixed(3);

        html = `
            <div class="eng-stats-grid">
                <div class="eng-stats-card">
                    <h4>📊 Descriptive Statistics — ${dimLabel}</h4>
                    <div class="eng-stat-row"><span>N (units)</span><strong>${stats.n}</strong></div>
                    <div class="eng-stat-row"><span>Mean</span><strong>${stats.mean.toFixed(3)}</strong></div>
                    <div class="eng-stat-row"><span>Std. Deviation</span><strong>${stats.sd.toFixed(3)}</strong></div>
                    <div class="eng-stat-row"><span>Min</span><strong>${stats.min.toFixed(3)}</strong></div>
                    <div class="eng-stat-row"><span>Max</span><strong>${stats.max.toFixed(3)}</strong></div>
                    <div class="eng-stat-row"><span>Range</span><strong>${stats.range.toFixed(3)}</strong></div>
                    <div class="eng-stat-row"><span>CV%</span><strong>${stats.cv.toFixed(1)}%</strong></div>
                    <div class="eng-stat-row"><span>Company Avg</span><strong>${compAvgDisplay}</strong></div>
                </div>
                <div class="eng-stats-card eng-chart-card">
                    <h4>🕸️ Company Engagement Profile</h4>
                    <div style="max-height:340px;display:flex;justify-content:center;"><canvas id="engRadarChart"></canvas></div>
                </div>
            </div>
            <div class="eng-table-card">
                <h4>📋 Unit Scores — ${dimLabel} (sorted by score)</h4>
                <table class="eng-table">
                    <thead><tr><th>Rank</th><th>Unit</th><th>Market</th><th>Score</th><th>vs. Avg</th><th>Status</th></tr></thead>
                    <tbody>
                    ${unitData.map((u, i) => {
                        const diff = u.score - stats.mean;
                        const status = diff > stats.sd ? '🟢 High' : (diff < -stats.sd ? '🔴 Low' : '🟡 Average');
                        const diffColor = diff > 0 ? '#22c55e' : (diff < -0.1 ? '#ef4444' : '#f59e0b');
                        return `<tr>
                            <td>${i+1}</td>
                            <td>Unit ${u.id}</td>
                            <td>${u.market}</td>
                            <td>${u.score.toFixed(3)}</td>
                            <td style="color:${diffColor};font-weight:600">${diff > 0 ? '+' : ''}${diff.toFixed(3)}</td>
                            <td>${status}</td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (analysis === 'exempt' || analysis === 'gender' || analysis === 'race') {
        // Category comparison — group1 and group2 are arrays of all 9 dimension averages
        const s1 = desc(group1);
        const s2 = desc(group2);
        const idx = isAllDims ? -1 : dims.indexOf(dim);
        const v1 = isAllDims ? mean(group1) : (group1[idx] || 0);
        const v2 = isAllDims ? mean(group2) : (group2[idx] || 0);
        const diffVal = v1 - v2;

        html = `
            <div class="eng-stats-grid">
                <div class="eng-stats-card">
                    <h4>📊 ${g1Label} vs ${g2Label} — ${dimLabel}</h4>
                    <table class="indepth-table">
                        <tr><th>Metric</th><th>${g1Label}</th><th>${g2Label}</th></tr>
                        <tr><td>${dimLabel} Score</td><td><strong>${v1.toFixed(3)}</strong></td><td><strong>${v2.toFixed(3)}</strong></td></tr>
                        <tr><td>Difference</td><td colspan="2" style="color:${diffVal > 0 ? '#22c55e' : (diffVal < 0 ? '#ef4444' : '#f59e0b')};font-weight:700">${diffVal > 0 ? '+' : ''}${diffVal.toFixed(3)}</td></tr>
                        <tr><td>Mean (all dims)</td><td>${s1.mean.toFixed(3)}</td><td>${s2.mean.toFixed(3)}</td></tr>
                        <tr><td>SD (all dims)</td><td>${s1.sd.toFixed(3)}</td><td>${s2.sd.toFixed(3)}</td></tr>
                        <tr><td>Min</td><td>${s1.min.toFixed(3)}</td><td>${s2.min.toFixed(3)}</td></tr>
                        <tr><td>Max</td><td>${s1.max.toFixed(3)}</td><td>${s2.max.toFixed(3)}</td></tr>
                    </table>
                    <div class="eng-all-dims">
                        <h5 style="margin-top:16px;color:#a5b4fc;">All Dimensions Comparison</h5>
                        <table class="indepth-detail-table">
                            <thead><tr><th>Dimension</th><th>${g1Label}</th><th>${g2Label}</th><th>Δ</th><th>Favors</th></tr></thead>
                            <tbody>
                            ${dims.map((d, i) => {
                                const a = group1[i] || 0, b = group2[i] || 0, delta = a - b;
                                return `<tr class="${delta > 0.1 ? 'row-protect' : (delta < -0.1 ? 'row-risk' : '')}">
                                    <td>${dimLabels[d]}</td>
                                    <td>${a.toFixed(3)}</td>
                                    <td>${b.toFixed(3)}</td>
                                    <td style="color:${delta > 0 ? '#22c55e' : (delta < 0 ? '#ef4444' : '#9ca3af')};font-weight:600">${delta > 0 ? '+' : ''}${delta.toFixed(3)}</td>
                                    <td>${delta > 0.05 ? g1Label : (delta < -0.05 ? g2Label : 'Even')}</td>
                                </tr>`;
                            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="eng-stats-card eng-chart-card">
                    <h4>🕸️ ${g1Label} vs ${g2Label} Radar</h4>
                    <div style="max-height:320px;display:flex;justify-content:center;"><canvas id="engRadarChart"></canvas></div>
                </div>
            </div>
        `;
    } else if (analysis === 'market') {
        // Market comparison — split units by market
        const s1 = desc(group1);
        const s2 = desc(group2);
        // t-test
        const n1 = s1.n, n2 = s2.n;
        const pooledSE = Math.sqrt((s1.sd*s1.sd/n1) + (s2.sd*s2.sd/n2));
        const tStat = pooledSE > 0 ? (s1.mean - s2.mean) / pooledSE : 0;
        const df = n1 + n2 - 2;
        const pVal = df > 0 ? tTestP(Math.abs(tStat), df) : 1;
        const sig = pVal < 0.05;
        // Cohen's d
        const pooledSD = Math.sqrt(((n1-1)*s1.sd*s1.sd + (n2-1)*s2.sd*s2.sd) / (n1+n2-2));
        const cohensD = pooledSD > 0 ? (s1.mean - s2.mean) / pooledSD : 0;
        const effectLabel = Math.abs(cohensD) < 0.2 ? 'Negligible' : (Math.abs(cohensD) < 0.5 ? 'Small' : (Math.abs(cohensD) < 0.8 ? 'Medium' : 'Large'));

        // Also compute group radar profiles
        const g1Radar = dims.map(d => mean(allUnitIds.filter(id => D.module1.unitHeadcount[id]?.market === 'Large').map(id => ue[id][d] || 0)));
        const g2Radar = dims.map(d => mean(allUnitIds.filter(id => D.module1.unitHeadcount[id]?.market !== 'Large').map(id => ue[id][d] || 0)));

        html = `
            <div class="eng-stats-grid">
                <div class="eng-stats-card">
                    <h4>📊 ${dimLabel} — Large vs Medium Market</h4>
                    <table class="indepth-table">
                        <tr><th>Statistic</th><th>Large Mkt</th><th>Medium Mkt</th></tr>
                        <tr><td>N</td><td>${s1.n}</td><td>${s2.n}</td></tr>
                        <tr><td>Mean</td><td>${s1.mean.toFixed(3)}</td><td>${s2.mean.toFixed(3)}</td></tr>
                        <tr><td>Std. Deviation</td><td>${s1.sd.toFixed(3)}</td><td>${s2.sd.toFixed(3)}</td></tr>
                        <tr><td>Min</td><td>${s1.min.toFixed(3)}</td><td>${s2.min.toFixed(3)}</td></tr>
                        <tr><td>Max</td><td>${s1.max.toFixed(3)}</td><td>${s2.max.toFixed(3)}</td></tr>
                    </table>
                    <div class="eng-test-results">
                        <h5>Independent Samples t-Test</h5>
                        <div class="eng-stat-row"><span>t-statistic</span><strong>${tStat.toFixed(3)}</strong></div>
                        <div class="eng-stat-row"><span>Degrees of Freedom</span><strong>${df}</strong></div>
                        <div class="eng-stat-row"><span>p-value</span><strong style="color:${sig ? '#ef4444' : '#22c55e'}">${pVal.toFixed(4)} ${sig ? '✱ Significant' : '(not significant)'}</strong></div>
                        <div class="eng-stat-row"><span>Cohen's d</span><strong>${cohensD.toFixed(3)} (${effectLabel})</strong></div>
                        <div class="eng-stat-row"><span>Mean Difference</span><strong>${(s1.mean - s2.mean).toFixed(3)}</strong></div>
                    </div>
                    <div class="eng-all-dims">
                        <h5 style="margin-top:16px;color:#a5b4fc;">All Dimensions — Market Comparison</h5>
                        <table class="indepth-detail-table">
                            <thead><tr><th>Dimension</th><th>Large</th><th>Medium</th><th>Δ</th></tr></thead>
                            <tbody>
                            ${dims.map((d, i) => {
                                const delta = g1Radar[i] - g2Radar[i];
                                return `<tr>
                                    <td>${dimLabels[d]}</td>
                                    <td>${g1Radar[i].toFixed(3)}</td>
                                    <td>${g2Radar[i].toFixed(3)}</td>
                                    <td style="color:${delta > 0 ? '#22c55e' : (delta < 0 ? '#ef4444' : '#9ca3af')};font-weight:600">${delta > 0 ? '+' : ''}${delta.toFixed(3)}</td>
                                </tr>`;
                            }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="eng-stats-card eng-chart-card">
                    <h4>🕸️ Large vs Medium Market Radar</h4>
                    <div style="max-height:320px;display:flex;justify-content:center;"><canvas id="engRadarChart"></canvas></div>
                </div>
            </div>
        `;
    }

    document.getElementById('engResults').innerHTML = html;

    // Draw radar chart
    const radarCanvas = document.getElementById('engRadarChart');
    if (radarCanvas) {
        if (activeCharts['engRadarChart']) activeCharts['engRadarChart'].destroy();
        const radarLabels = dims.map(d => dimLabels[d]);
        let datasets = [];

        if (analysis === 'unit') {
            datasets.push({
                label: 'Company Average',
                data: dims.map(d => D.engagement.companyAvg[d] || 0),
                backgroundColor: 'rgba(99,102,241,0.2)',
                borderColor: '#6366f1',
                borderWidth: 2,
                pointRadius: 4,
            });
        } else if (analysis === 'market') {
            const g1R = dims.map(d => mean(allUnitIds.filter(id => D.module1.unitHeadcount[id]?.market === 'Large').map(id => ue[id][d] || 0)));
            const g2R = dims.map(d => mean(allUnitIds.filter(id => D.module1.unitHeadcount[id]?.market !== 'Large').map(id => ue[id][d] || 0)));
            datasets.push({ label: 'Large Market', data: g1R, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1', borderWidth: 2, pointRadius: 3 });
            datasets.push({ label: 'Medium Market', data: g2R, backgroundColor: 'rgba(245,158,11,0.2)', borderColor: '#f59e0b', borderWidth: 2, pointRadius: 3 });
        } else {
            datasets.push({ label: g1Label, data: group1, backgroundColor: 'rgba(99,102,241,0.2)', borderColor: '#6366f1', borderWidth: 2, pointRadius: 3 });
            if (group2.length) datasets.push({ label: g2Label, data: group2, backgroundColor: 'rgba(245,158,11,0.2)', borderColor: '#f59e0b', borderWidth: 2, pointRadius: 3 });
        }

        activeCharts['engRadarChart'] = new Chart(radarCanvas, {
            type: 'radar',
            data: { labels: radarLabels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 3.0,
                        max: 5.0,
                        ticks: {
                            stepSize: 0.5,
                            color: '#cbd5e1',
                            font: { size: 11 },
                            backdropColor: 'rgba(15,23,42,0.75)',
                            z: 1
                        },
                        grid: { color: 'rgba(148,163,184,0.2)', lineWidth: 1.2 },
                        angleLines: { color: 'rgba(148,163,184,0.15)' },
                        pointLabels: { color: '#e2e8f0', font: { size: 12, weight: '500' }, padding: 14 }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#e2e8f0', font: { size: 12 }, padding: 14 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }
}

function renderTurnoverPrediction() {
    const units = Object.keys(D.module1.unitHeadcount).sort((a,b) => +a - +b);
    const unitOpts = units.map(id => `<option value="${id}">Unit ${id} (${D.module1.unitHeadcount[id].market})</option>`).join('');

    document.getElementById('statsPredict').innerHTML = `
        <div class="stats-controls">
            <div class="stats-control-group">
                <label class="stats-ctrl-label">🏪 Select Unit</label>
                <select id="predUnit" class="stats-select" onchange="runTurnoverPrediction()">
                    <option value="ALL">📊 All Units</option>
                    <option value="LARGE">📊 Large Market Units</option>
                    <option value="MEDIUM">📊 Medium Market Units</option>
                    <optgroup label="Individual Units">
                    ${unitOpts}
                    </optgroup>
                </select>
            </div>
            <div class="stats-control-group">
                <label class="stats-ctrl-label">👥 Job Category</label>
                <select id="predJobCat" class="stats-select" onchange="runTurnoverPrediction()">
                    <option value="all">All Employees</option>
                    <optgroup label="By Classification">
                    <option value="mgmt">Management (Exempt)</option>
                    <option value="hourly">Hourly Staff (Non-Exempt)</option>
                    </optgroup>
                    <optgroup label="By Job Title">
                    <option value="waitstaff">Wait Staff / Servers</option>
                    <option value="bartender">Bartenders</option>
                    <option value="linecook">Line Cooks</option>
                    <option value="host">Host / Hostess</option>
                    <option value="busser">Bussers / Dishwashers</option>
                    <option value="asstmgr">Assistant Managers</option>
                    <option value="shiftlead">Shift Leads</option>
                    <option value="kitchen">Kitchen Staff (BOH)</option>
                    </optgroup>
                    <optgroup label="By Age Group">
                    <option value="young">Young Workers (18-25)</option>
                    <option value="mid">Mid-Career (26-45)</option>
                    <option value="senior">Senior Workers (46+)</option>
                    </optgroup>
                </select>
            </div>
            <button class="stats-run-btn" onclick="runTurnoverPrediction()">Predict Turnover</button>
        </div>
        <div id="predResults"></div>
    `;
    runTurnoverPrediction();
}

function runTurnoverPrediction() {
    const unitSel = document.getElementById('predUnit').value;
    const isGroup = ['ALL','LARGE','MEDIUM'].includes(unitSel);
    const jobCat = document.getElementById('predJobCat').value;
    const jobCatLabels = { all: 'All Employees', mgmt: 'Management (Exempt)', hourly: 'Hourly Staff (Non-Exempt)', young: 'Young Workers (18-25)', mid: 'Mid-Career (26-45)', senior: 'Senior Workers (46+)', waitstaff: 'Wait Staff / Servers', bartender: 'Bartenders', linecook: 'Line Cooks', host: 'Host / Hostess', busser: 'Bussers / Dishwashers', asstmgr: 'Assistant Managers', shiftlead: 'Shift Leads', kitchen: 'Kitchen Staff (BOH)' };
    const jobCatLabel = jobCatLabels[jobCat] || 'All Employees';

    let unitHC, unitTO, unitEng, unitRest, unitFR, mgr, unitLabel;

    if (isGroup) {
        // Aggregate across matching units
        const matchIds = Object.keys(D.module1.unitHeadcount).filter(id => {
            if (unitSel === 'ALL') return true;
            return D.module1.unitHeadcount[id].market === (unitSel === 'LARGE' ? 'Large' : 'Medium');
        });
        if (matchIds.length === 0) {
            document.getElementById('predResults').innerHTML = '<div class="stats-no-data">No units match this selection.</div>';
            return;
        }
        unitLabel = unitSel === 'ALL' ? 'All Units' : (unitSel === 'LARGE' ? 'Large Market' : 'Medium Market');
        // Aggregate headcount
        const totalHC = matchIds.reduce((s, id) => s + D.module1.unitHeadcount[id].total, 0);
        unitHC = { market: unitSel === 'LARGE' ? 'Large' : (unitSel === 'MEDIUM' ? 'Medium' : 'Mixed'), total: totalHC };
        // Aggregate turnover
        const totQuit = matchIds.reduce((s, id) => s + D.module2.turnoverByUnit[id].quit, 0);
        const totDischarged = matchIds.reduce((s, id) => s + D.module2.turnoverByUnit[id].discharged, 0);
        const totEmployed = matchIds.reduce((s, id) => s + D.module2.turnoverByUnit[id].employed, 0);
        unitTO = { quit: totQuit, discharged: totDischarged, employed: totEmployed };
        // Aggregate engagement (mean across units)
        const engKeys = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
        unitEng = {};
        engKeys.forEach(k => {
            unitEng[k] = mean(matchIds.map(id => (D.engagement.unitEngagement[id]||{})[k] || 0));
        });
        // Aggregate financials
        const restIds = matchIds.filter(id => D.restaurant.performanceByUnit2026[id]);
        if (restIds.length > 0) {
            unitRest = {
                sales: restIds.reduce((s, id) => s + D.restaurant.performanceByUnit2026[id].sales, 0),
                cogs: restIds.reduce((s, id) => s + D.restaurant.performanceByUnit2026[id].cogs, 0),
                payroll: restIds.reduce((s, id) => s + D.restaurant.performanceByUnit2026[id].payroll, 0),
                fixedOps: restIds.reduce((s, id) => s + D.restaurant.performanceByUnit2026[id].fixedOps, 0),
                profit: restIds.reduce((s, id) => s + D.restaurant.performanceByUnit2026[id].profit, 0),
            };
        }
        // Aggregate flight risk
        const frTotal = matchIds.reduce((s, id) => s + ((D.module2.flightRiskUnits[id]||{}).declining||0), 0);
        unitFR = { declining: frTotal, market: unitHC.market };
        // Average manager stats across matching units
        const matchMgrs = D.module4.scatterManagers.filter(m => matchIds.includes(String(m.unit)));
        mgr = matchMgrs.length > 0 ? {
            wage: mean(matchMgrs.map(m => m.wage)),
            perf: mean(matchMgrs.map(m => m.perf)),
            exp: mean(matchMgrs.map(m => m.exp)),
            unit: unitSel
        } : null;
    } else {
        // Single unit
        const unitId = unitSel;
        unitLabel = `Unit ${unitId}`;
        unitHC = D.module1.unitHeadcount[unitId];
        unitTO = D.module2.turnoverByUnit[unitId];
        unitEng = D.engagement.unitEngagement[unitId];
        unitRest = D.restaurant.performanceByUnit2026[unitId];
        unitFR = D.module2.flightRiskUnits[unitId];
        mgr = D.module4.scatterManagers.find(m => String(m.unit) === String(unitId));
    }

    if (!unitHC || !unitTO || !unitEng) {
        document.getElementById('predResults').innerHTML = '<div class="stats-no-data">Missing data for this selection.</div>';
        return;
    }

    // Compute company averages for comparison
    const allUnits = Object.keys(D.module1.unitHeadcount);
    const allTORates = allUnits.map(id => {
        const u = D.module2.turnoverByUnit[id];
        const tot = u.quit + u.discharged;
        return u.employed > 0 ? tot/(u.employed+tot)*100 : 0;
    });
    const avgTO = mean(allTORates);
    const sdTO = sd(allTORates);
    const avgEngKeys = ['jobSatisfaction','collaboration','communication','support','customerFocus','personalGrowth','inclusion','empowerment','accountability'];
    const avgEng = {};
    avgEngKeys.forEach(k => {
        avgEng[k] = mean(allUnits.map(id => (D.engagement.unitEngagement[id]||{})[k] || 0));
    });

    // Company-wide averages for financial metrics
    const allRest = Object.values(D.restaurant.performanceByUnit2026);
    const avgPayrollRatio = mean(allRest.map(r => r.sales > 0 ? r.payroll / r.sales * 100 : 0));
    const avgCOGSRatio = mean(allRest.map(r => r.sales > 0 ? r.cogs / r.sales * 100 : 0));
    const avgProfitMargin = mean(allRest.map(r => r.sales > 0 ? r.profit / r.sales * 100 : 0));
    const avgHeadcount = mean(allUnits.map(id => D.module1.unitHeadcount[id].total));
    const avgMgrWage = mean(D.module4.scatterManagers.map(m => m.wage));
    const avgMgrPerf = mean(D.module4.scatterManagers.map(m => m.perf));

    // Actual turnover for this unit
    const totalExits = unitTO.quit + unitTO.discharged;
    const actualRate = unitTO.employed > 0 ? totalExits / (unitTO.employed + totalExits) * 100 : 0;

    // Compute unit overall engagement average
    const unitEngAvg = mean(avgEngKeys.map(k => unitEng[k] || 0));
    const compEngAvg = mean(avgEngKeys.map(k => avgEng[k]));

    // Scoring model: factors that increase turnover risk
    let riskScore = 50; // baseline
    const factors = [];

    // 1. Market effect
    if (unitHC.market === 'Medium') {
        riskScore += 8;
        factors.push({ factor: 'Medium Market', impact: +8, detail: 'Medium markets tend to have higher turnover' });
    } else {
        riskScore -= 5;
        factors.push({ factor: 'Large Market', impact: -5, detail: 'Large markets tend to have slightly lower turnover' });
    }

    // 2. Engagement factors (below average = risk increase)
    avgEngKeys.forEach(k => {
        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        const diff = unitEng[k] - avgEng[k];
        if (diff < -0.3) {
            const impact = Math.round(Math.abs(diff) * 8);
            riskScore += impact;
            factors.push({ factor: `Low ${label}`, impact: +impact, detail: `${unitEng[k].toFixed(2)} vs avg ${avgEng[k].toFixed(2)}` });
        } else if (diff > 0.3) {
            const impact = Math.round(diff * 5);
            riskScore -= impact;
            factors.push({ factor: `High ${label}`, impact: -impact, detail: `${unitEng[k].toFixed(2)} vs avg ${avgEng[k].toFixed(2)}` });
        }
    });

    // 3. Headcount effect
    if (unitHC.total > avgHeadcount + 8) {
        riskScore += 5;
        factors.push({ factor: 'High Headcount', impact: +5, detail: `${unitHC.total} employees vs avg ${avgHeadcount.toFixed(0)}` });
    } else if (unitHC.total < avgHeadcount - 8) {
        riskScore += 3;
        factors.push({ factor: 'Low Headcount', impact: +3, detail: `${unitHC.total} employees — understaffing risk` });
    }

    // 4. Profitability effect
    if (unitRest) {
        const margin = unitRest.sales > 0 ? (unitRest.profit / unitRest.sales * 100) : 0;
        if (unitRest.profit < 0) {
            riskScore += 10;
            factors.push({ factor: 'Unprofitable Unit', impact: +10, detail: `Profit: $${unitRest.profit.toLocaleString()}` });
        } else if (margin < avgProfitMargin - 5) {
            riskScore += 5;
            factors.push({ factor: 'Low Profit Margin', impact: +5, detail: `${margin.toFixed(1)}% vs avg ${avgProfitMargin.toFixed(1)}%` });
        } else if (margin > avgProfitMargin + 5) {
            riskScore -= 4;
            factors.push({ factor: 'Strong Profit Margin', impact: -4, detail: `${margin.toFixed(1)}% vs avg ${avgProfitMargin.toFixed(1)}%` });
        }
    }

    // 5. Flight Risk Employees
    if (unitFR && unitFR.declining > 0) {
        const frImpact = Math.min(unitFR.declining * 6, 15);
        riskScore += frImpact;
        factors.push({ factor: 'Flight Risk Employees', impact: +frImpact, detail: `${unitFR.declining} employee(s) with declining engagement` });
    }

    // 6. Manager Performance
    if (mgr) {
        if (mgr.perf <= 2) {
            riskScore += 8;
            factors.push({ factor: 'Low Manager Performance', impact: +8, detail: `Rating: ${mgr.perf}/5 — poor leadership increases turnover` });
        } else if (mgr.perf >= 5) {
            riskScore -= 6;
            factors.push({ factor: 'Strong Manager Performance', impact: -6, detail: `Rating: ${mgr.perf}/5 — excellent leadership retains staff` });
        } else if (mgr.perf <= 3) {
            riskScore += 3;
            factors.push({ factor: 'Below-Avg Manager Performance', impact: +3, detail: `Rating: ${mgr.perf}/5 vs avg ${avgMgrPerf.toFixed(1)}` });
        }
    }

    // 7. Manager Experience
    if (mgr) {
        if (mgr.exp === 0) {
            riskScore += 6;
            factors.push({ factor: 'Inexperienced Manager', impact: +6, detail: `0 years experience — new managers face higher turnover` });
        } else if (mgr.exp >= 4) {
            riskScore -= 4;
            factors.push({ factor: 'Experienced Manager', impact: -4, detail: `${mgr.exp} years experience — stability reduces turnover` });
        }
    }

    // 8. Manager Wage Competitiveness
    if (mgr) {
        const wageDiff = ((mgr.wage - avgMgrWage) / avgMgrWage) * 100;
        if (wageDiff < -10) {
            riskScore += 5;
            factors.push({ factor: 'Below-Market Mgr Wage', impact: +5, detail: `$${mgr.wage.toLocaleString()} vs avg $${Math.round(avgMgrWage).toLocaleString()} (${wageDiff.toFixed(0)}%)` });
        } else if (wageDiff > 15) {
            riskScore -= 3;
            factors.push({ factor: 'Competitive Mgr Wage', impact: -3, detail: `$${mgr.wage.toLocaleString()} vs avg $${Math.round(avgMgrWage).toLocaleString()} (+${wageDiff.toFixed(0)}%)` });
        }
    }

    // 9. Payroll-to-Sales Ratio (labor cost pressure)
    if (unitRest && unitRest.sales > 0) {
        const payrollRatio = unitRest.payroll / unitRest.sales * 100;
        if (payrollRatio > avgPayrollRatio + 5) {
            riskScore += 4;
            factors.push({ factor: 'High Labor Cost Ratio', impact: +4, detail: `Payroll ${payrollRatio.toFixed(1)}% of sales vs avg ${avgPayrollRatio.toFixed(1)}%` });
        } else if (payrollRatio < avgPayrollRatio - 5) {
            riskScore -= 3;
            factors.push({ factor: 'Efficient Labor Cost', impact: -3, detail: `Payroll ${payrollRatio.toFixed(1)}% of sales vs avg ${avgPayrollRatio.toFixed(1)}%` });
        }
    }

    // 10. COGS Ratio
    if (unitRest && unitRest.sales > 0) {
        const cogsRatio = unitRest.cogs / unitRest.sales * 100;
        if (cogsRatio > avgCOGSRatio + 5) {
            riskScore += 3;
            factors.push({ factor: 'High COGS Ratio', impact: +3, detail: `COGS ${cogsRatio.toFixed(1)}% of sales vs avg ${avgCOGSRatio.toFixed(1)}% — operational pressure` });
        }
    }

    // 11. Actual Turnover vs Company Average
    const toDiff = actualRate - avgTO;
    if (toDiff > sdTO) {
        const impact = Math.min(Math.round(toDiff / 2), 10);
        riskScore += impact;
        factors.push({ factor: 'Above-Avg Historical Turnover', impact: +impact, detail: `${actualRate.toFixed(1)}% vs avg ${avgTO.toFixed(1)}% — pattern suggests ongoing risk` });
    } else if (toDiff < -sdTO) {
        const impact = Math.min(Math.round(Math.abs(toDiff) / 3), 6);
        riskScore -= impact;
        factors.push({ factor: 'Below-Avg Historical Turnover', impact: -impact, detail: `${actualRate.toFixed(1)}% vs avg ${avgTO.toFixed(1)}%` });
    }

    // 12. Quit-to-Discharge Ratio (high quit ratio = voluntary attrition issue)
    if (totalExits > 0) {
        const quitPct = unitTO.quit / totalExits * 100;
        if (quitPct > 80) {
            riskScore += 4;
            factors.push({ factor: 'High Voluntary Quit Ratio', impact: +4, detail: `${quitPct.toFixed(0)}% of exits are quits — retention issue` });
        } else if (quitPct < 60) {
            riskScore += 3;
            factors.push({ factor: 'High Discharge Ratio', impact: +3, detail: `${(100-quitPct).toFixed(0)}% of exits are discharges — workforce quality concern` });
        }
    }

    // 13. Job Category–Specific Factors
    const ec = D.engagement.engByCategory;
    if (jobCat === 'mgmt') {
        // Management-specific risk
        const exemptEng = ec.Exempt || {};
        const nonExemptEng = ec['Non-Exempt'] || {};
        if (exemptEng.jobSatisfaction && exemptEng.jobSatisfaction < 5.0) {
            riskScore += 6;
            factors.push({ factor: 'Low Mgmt Job Satisfaction', impact: +6, detail: `Exempt avg: ${exemptEng.jobSatisfaction.toFixed(2)} — dissatisfied managers leave sooner` });
        }
        if (mgr && mgr.perf >= 4 && mgr.wage < avgMgrWage) {
            riskScore += 7;
            factors.push({ factor: 'High-Performer Underpaid', impact: +7, detail: `Top-rated manager ($${mgr.wage.toLocaleString()}) below avg ($${Math.round(avgMgrWage).toLocaleString()}) — flight risk` });
        }
        riskScore += 3;
        factors.push({ factor: 'Management Turnover Cost', impact: +3, detail: 'Management turnover costs 1.5–2× annual salary to replace' });
    } else if (jobCat === 'hourly') {
        // Hourly/Non-exempt specific risk
        const nonExemptEng = ec['Non-Exempt'] || {};
        if (nonExemptEng.jobSatisfaction && nonExemptEng.jobSatisfaction < 4.5) {
            riskScore += 5;
            factors.push({ factor: 'Low Hourly Job Satisfaction', impact: +5, detail: `Non-Exempt avg: ${nonExemptEng.jobSatisfaction.toFixed(2)} — hourly workers quit for small pay differences` });
        }
        if (nonExemptEng.empowerment && nonExemptEng.empowerment < 4.5) {
            riskScore += 4;
            factors.push({ factor: 'Low Hourly Empowerment', impact: +4, detail: `Non-Exempt empowerment: ${nonExemptEng.empowerment.toFixed(2)} — lack of autonomy drives turnover` });
        }
        riskScore += 8;
        factors.push({ factor: 'Hourly Employee Baseline Risk', impact: +8, detail: 'Hourly workers have 2–3× higher turnover than salaried staff' });
    } else if (jobCat === 'young') {
        // Young workers (18-25)
        const youngPct = (D.module1.ageBrackets['18-25'] || 0) / D.module1.totalHeadcount * 100;
        riskScore += 12;
        factors.push({ factor: 'Young Worker Baseline Risk', impact: +12, detail: `18-25 age group has highest turnover; ${youngPct.toFixed(0)}% of workforce` });
        if (unitEng.personalGrowth < avgEng.personalGrowth) {
            riskScore += 5;
            factors.push({ factor: 'Low Growth Opportunities', impact: +5, detail: `Personal Growth ${unitEng.personalGrowth.toFixed(2)} vs avg ${avgEng.personalGrowth.toFixed(2)} — critical for retaining young talent` });
        }
        if (unitEng.inclusion && unitEng.inclusion < avgEng.inclusion) {
            riskScore += 4;
            factors.push({ factor: 'Low Inclusion (Youth)', impact: +4, detail: `${unitEng.inclusion.toFixed(2)} vs avg ${avgEng.inclusion.toFixed(2)} — young employees value belonging` });
        }
    } else if (jobCat === 'mid') {
        // Mid-career (26-45)
        const midPct = ((D.module1.ageBrackets['26-35'] || 0) + (D.module1.ageBrackets['36-45'] || 0)) / D.module1.totalHeadcount * 100;
        if (mgr && mgr.exp >= 2 && mgr.exp <= 4) {
            riskScore += 4;
            factors.push({ factor: 'Mid-Career Mobility Risk', impact: +4, detail: `Mgr has ${mgr.exp} yrs exp — prime window for external offers` });
        }
        if (unitEng.personalGrowth < avgEng.personalGrowth) {
            riskScore += 6;
            factors.push({ factor: 'Career Stagnation Risk', impact: +6, detail: `Growth score ${unitEng.personalGrowth.toFixed(2)} vs avg ${avgEng.personalGrowth.toFixed(2)} — mid-career employees need advancement` });
        }
        factors.push({ factor: 'Mid-Career Profile', impact: 0, detail: `26-45 group represents ${midPct.toFixed(0)}% of workforce` });
    } else if (jobCat === 'senior') {
        // Senior workers (46+)
        const seniorPct = ((D.module1.ageBrackets['46-55'] || 0) + (D.module1.ageBrackets['56-65'] || 0) + (D.module1.ageBrackets['65+'] || 0)) / D.module1.totalHeadcount * 100;
        riskScore -= 8;
        factors.push({ factor: 'Senior Worker Stability', impact: -8, detail: `46+ workers have lower voluntary turnover; ${seniorPct.toFixed(0)}% of workforce` });
        if (unitEng.support && unitEng.support < avgEng.support) {
            riskScore += 5;
            factors.push({ factor: 'Low Support (Seniors)', impact: +5, detail: `Support ${unitEng.support.toFixed(2)} vs avg ${avgEng.support.toFixed(2)} — senior workers may feel undervalued` });
        }
    } else if (jobCat === 'waitstaff') {
        riskScore += 15;
        factors.push({ factor: 'Wait Staff Baseline Risk', impact: +15, detail: 'Restaurant servers average 70-80% annual turnover industry-wide' });
        if (unitEng.customerFocus && unitEng.customerFocus < avgEng.customerFocus) {
            riskScore += 5;
            factors.push({ factor: 'Low Customer Focus', impact: +5, detail: `${unitEng.customerFocus.toFixed(2)} vs avg ${avgEng.customerFocus.toFixed(2)} — servers need customer engagement to stay motivated` });
        }
        if (unitEng.empowerment && unitEng.empowerment < avgEng.empowerment) {
            riskScore += 4;
            factors.push({ factor: 'Low Empowerment (FOH)', impact: +4, detail: `${unitEng.empowerment.toFixed(2)} vs avg ${avgEng.empowerment.toFixed(2)} — servers leave when they lack autonomy` });
        }
        if (unitEng.jobSatisfaction && unitEng.jobSatisfaction > avgEng.jobSatisfaction + 0.3) {
            riskScore -= 5;
            factors.push({ factor: 'Good Job Satisfaction', impact: -5, detail: `${unitEng.jobSatisfaction.toFixed(2)} — satisfied servers are more loyal` });
        }
    } else if (jobCat === 'bartender') {
        riskScore += 10;
        factors.push({ factor: 'Bartender Baseline Risk', impact: +10, detail: 'Bartenders have high mobility — skills transfer easily between venues' });
        if (unitEng.inclusion && unitEng.inclusion < avgEng.inclusion) {
            riskScore += 5;
            factors.push({ factor: 'Low Inclusion (Bar)', impact: +5, detail: `${unitEng.inclusion.toFixed(2)} vs avg ${avgEng.inclusion.toFixed(2)} — team culture critical for bar staff retention` });
        }
        if (unitEng.collaboration && unitEng.collaboration > avgEng.collaboration + 0.3) {
            riskScore -= 4;
            factors.push({ factor: 'Strong Team Collaboration', impact: -4, detail: `${unitEng.collaboration.toFixed(2)} — good bar team cohesion reduces turnover` });
        }
        if (unitRest && unitRest.sales > 0) {
            const salesPerHead = unitRest.sales / unitHC.total;
            riskScore -= 3;
            factors.push({ factor: 'Revenue Per Employee', impact: -3, detail: `$${Math.round(salesPerHead).toLocaleString()} — higher volume venues retain bartenders better` });
        }
    } else if (jobCat === 'linecook') {
        riskScore += 12;
        factors.push({ factor: 'Line Cook Baseline Risk', impact: +12, detail: 'Line cooks face high physical demands and burnout — avg tenure 8-14 months' });
        if (unitEng.support && unitEng.support < avgEng.support) {
            riskScore += 6;
            factors.push({ factor: 'Low Support (Kitchen)', impact: +6, detail: `${unitEng.support.toFixed(2)} vs avg ${avgEng.support.toFixed(2)} — kitchen staff need strong management support` });
        }
        if (unitEng.personalGrowth && unitEng.personalGrowth < avgEng.personalGrowth) {
            riskScore += 4;
            factors.push({ factor: 'Limited Growth Path', impact: +4, detail: `${unitEng.personalGrowth.toFixed(2)} vs avg ${avgEng.personalGrowth.toFixed(2)} — cooks leave without advancement opportunities` });
        }
        if (unitEng.communication && unitEng.communication > avgEng.communication + 0.3) {
            riskScore -= 4;
            factors.push({ factor: 'Good Kitchen Communication', impact: -4, detail: `${unitEng.communication.toFixed(2)} — clear communication reduces kitchen conflicts and turnover` });
        }
    } else if (jobCat === 'host') {
        riskScore += 14;
        factors.push({ factor: 'Host/Hostess Baseline Risk', impact: +14, detail: 'Entry-level FOH role — often first job; very high turnover (80-100%)' });
        if (unitEng.inclusion && unitEng.inclusion < avgEng.inclusion) {
            riskScore += 5;
            factors.push({ factor: 'Low Inclusion (Hosts)', impact: +5, detail: `${unitEng.inclusion.toFixed(2)} vs avg ${avgEng.inclusion.toFixed(2)} — hosts need to feel part of the team` });
        }
        if (unitEng.personalGrowth && unitEng.personalGrowth > avgEng.personalGrowth) {
            riskScore -= 5;
            factors.push({ factor: 'Growth Opportunity', impact: -5, detail: `${unitEng.personalGrowth.toFixed(2)} — hosts who see a path to server/bartender stay longer` });
        }
    } else if (jobCat === 'busser') {
        riskScore += 18;
        factors.push({ factor: 'Busser/Dishwasher Baseline Risk', impact: +18, detail: 'Highest turnover role in restaurants — physically demanding, lowest pay' });
        if (unitEng.accountability && unitEng.accountability < avgEng.accountability) {
            riskScore += 4;
            factors.push({ factor: 'Low Accountability', impact: +4, detail: `${unitEng.accountability.toFixed(2)} vs avg ${avgEng.accountability.toFixed(2)} — disengaged support staff leave quickly` });
        }
        if (unitEng.support && unitEng.support > avgEng.support + 0.3) {
            riskScore -= 6;
            factors.push({ factor: 'Strong Support System', impact: -6, detail: `${unitEng.support.toFixed(2)} — supportive environment retains entry-level staff` });
        }
    } else if (jobCat === 'asstmgr') {
        riskScore += 6;
        factors.push({ factor: 'Asst. Manager Baseline Risk', impact: +6, detail: 'Role ambiguity between hourly and salaried — common stepping stone to exit' });
        if (mgr && mgr.perf >= 4 && mgr.wage < avgMgrWage) {
            riskScore += 8;
            factors.push({ factor: 'High-Performing Underpaid', impact: +8, detail: `Wage $${typeof mgr.wage === 'number' ? mgr.wage.toLocaleString() : mgr.wage} vs avg $${Math.round(avgMgrWage).toLocaleString()} — top asst. mgrs get poached` });
        }
        if (unitEng.empowerment && unitEng.empowerment < avgEng.empowerment) {
            riskScore += 5;
            factors.push({ factor: 'Low Empowerment (Asst Mgr)', impact: +5, detail: `${unitEng.empowerment.toFixed(2)} vs avg ${avgEng.empowerment.toFixed(2)} — lack of decision-making authority drives exits` });
        }
        if (unitEng.personalGrowth && unitEng.personalGrowth > avgEng.personalGrowth + 0.3) {
            riskScore -= 5;
            factors.push({ factor: 'Clear Promotion Path', impact: -5, detail: `Growth score ${unitEng.personalGrowth.toFixed(2)} — visible path to GM retains asst. managers` });
        }
    } else if (jobCat === 'shiftlead') {
        riskScore += 8;
        factors.push({ factor: 'Shift Lead Baseline Risk', impact: +8, detail: 'Shift leads bear management burden without full compensation — moderate flight risk' });
        if (unitEng.communication && unitEng.communication < avgEng.communication) {
            riskScore += 5;
            factors.push({ factor: 'Poor Communication', impact: +5, detail: `${unitEng.communication.toFixed(2)} vs avg ${avgEng.communication.toFixed(2)} — shift leads need clear directives from management` });
        }
        if (unitEng.collaboration && unitEng.collaboration < avgEng.collaboration) {
            riskScore += 4;
            factors.push({ factor: 'Low Team Collaboration', impact: +4, detail: `${unitEng.collaboration.toFixed(2)} vs avg ${avgEng.collaboration.toFixed(2)} — shift leads struggle without team cooperation` });
        }
        if (mgr && mgr.perf >= 4) {
            riskScore -= 4;
            factors.push({ factor: 'Strong Manager Above', impact: -4, detail: `Manager rated ${typeof mgr.perf === 'number' ? mgr.perf.toFixed(1) : mgr.perf}/5 — good leadership retains shift leads` });
        }
    } else if (jobCat === 'kitchen') {
        riskScore += 13;
        factors.push({ factor: 'BOH Staff Baseline Risk', impact: +13, detail: 'Back-of-house staff face heat, pressure, and physical demands — avg turnover 60-80%' });
        if (unitEng.support && unitEng.support < avgEng.support) {
            riskScore += 5;
            factors.push({ factor: 'Low Support (BOH)', impact: +5, detail: `${unitEng.support.toFixed(2)} vs avg ${avgEng.support.toFixed(2)} — kitchen teams need strong managerial support` });
        }
        if (unitEng.communication && unitEng.communication < avgEng.communication) {
            riskScore += 4;
            factors.push({ factor: 'Poor Kitchen Communication', impact: +4, detail: `${unitEng.communication.toFixed(2)} vs avg ${avgEng.communication.toFixed(2)} — miscommunication causes kitchen friction` });
        }
        if (unitEng.accountability && unitEng.accountability > avgEng.accountability + 0.3) {
            riskScore -= 4;
            factors.push({ factor: 'High Accountability', impact: -4, detail: `${unitEng.accountability.toFixed(2)} — strong ownership culture retains BOH staff` });
        }
    }

    // Clamp 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel, riskColor, riskBg;
    if (riskScore >= 65) { riskLevel = 'HIGH'; riskColor = '#ef4444'; riskBg = 'rgba(239,68,68,0.1)'; }
    else if (riskScore >= 40) { riskLevel = 'MEDIUM'; riskColor = '#f59e0b'; riskBg = 'rgba(245,158,11,0.1)'; }
    else { riskLevel = 'LOW'; riskColor = '#22c55e'; riskBg = 'rgba(34,197,94,0.1)'; }

    // Sort factors by absolute impact
    factors.sort((a,b) => Math.abs(b.impact) - Math.abs(a.impact));

    const factorsHTML = factors.map(f => {
        const sign = f.impact > 0 ? '+' : '';
        const cls = f.impact > 0 ? 'pred-factor-bad' : 'pred-factor-good';
        return `<div class="pred-factor ${cls}">
            <span class="pred-factor-name">${f.factor}</span>
            <span class="pred-factor-detail">${f.detail}</span>
            <span class="pred-factor-impact">${sign}${f.impact}</span>
        </div>`;
    }).join('');

    // Build actual data items
    const profitMargin = unitRest && unitRest.sales > 0 ? (unitRest.profit / unitRest.sales * 100).toFixed(1) + '%' : '—';
    const mgrPerfLabel = mgr ? `${mgr.perf}/5` : '—';
    const mgrExpLabel = mgr ? `${mgr.exp} yrs` : '—';
    const mgrWageLabel = mgr ? `$${mgr.wage.toLocaleString()}` : '—';
    const frLabel = unitFR ? unitFR.declining : 0;

    document.getElementById('predResults').innerHTML = `
        <div class="pred-dashboard">
            <div class="pred-gauge-card" style="border-color: ${riskColor}">
                <div class="pred-gauge">
                    <svg viewBox="0 0 120 70" class="pred-gauge-svg">
                        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(51,65,85,0.4)" stroke-width="10" stroke-linecap="round"/>
                        <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="${riskColor}" stroke-width="10" stroke-linecap="round"
                            stroke-dasharray="${riskScore * 1.57} 157" />
                    </svg>
                    <div class="pred-gauge-value" style="color: ${riskColor}">${riskScore}</div>
                    <div class="pred-gauge-label">Risk Score</div>
                </div>
                <div class="pred-risk-level" style="color: ${riskColor}; background: ${riskBg}">${riskLevel} RISK</div>
            </div>
            <div class="pred-actual-card">
                <h4>${unitLabel} — ${jobCatLabel}</h4>
                <div class="pred-actual-grid">
                    <div class="pred-actual-item"><span>Market</span><strong>${unitHC.market}</strong></div>
                    <div class="pred-actual-item"><span>Headcount</span><strong>${unitHC.total}</strong></div>
                    <div class="pred-actual-item"><span>Quits</span><strong>${unitTO.quit}</strong></div>
                    <div class="pred-actual-item"><span>Discharged</span><strong>${unitTO.discharged}</strong></div>
                    <div class="pred-actual-item"><span>Actual Turnover</span><strong>${actualRate.toFixed(1)}%</strong></div>
                    <div class="pred-actual-item"><span>Company Avg</span><strong>${avgTO.toFixed(1)}%</strong></div>
                    <div class="pred-actual-item"><span>Profit</span><strong>${unitRest ? '$' + unitRest.profit.toLocaleString() : '—'}</strong></div>
                    <div class="pred-actual-item"><span>Profit Margin</span><strong>${profitMargin}</strong></div>
                    <div class="pred-actual-item"><span>Mgr Rating</span><strong>${mgrPerfLabel}</strong></div>
                    <div class="pred-actual-item"><span>Mgr Experience</span><strong>${mgrExpLabel}</strong></div>
                    <div class="pred-actual-item"><span>Mgr Wage</span><strong>${mgrWageLabel}</strong></div>
                    <div class="pred-actual-item"><span>Flight Risk</span><strong>${frLabel}</strong></div>
                    <div class="pred-actual-item"><span>Engagement Avg</span><strong>${unitEngAvg.toFixed(2)}</strong></div>
                    <div class="pred-actual-item"><span>Co. Eng Avg</span><strong>${compEngAvg.toFixed(2)}</strong></div>
                </div>
            </div>
        </div>
        <div class="pred-factors-card">
            <h4>📊 Contributing Factors (sorted by impact) — ${factors.length} variables analyzed</h4>
            <div class="pred-factors-list">
                ${factorsHTML || '<div class="pred-factor">No significant factors detected — near baseline.</div>'}
            </div>
            <div class="pred-factors-legend">
                <span class="pred-factor-bad">▲ Increases risk</span>
                <span class="pred-factor-good">▼ Decreases risk</span>
            </div>
        </div>
        <div class="pred-indepth-card">
            <button class="pred-indepth-toggle" onclick="document.getElementById('predIndepth').classList.toggle('open'); this.classList.toggle('open')">
                📈 In-Depth Stats <span class="toggle-arrow">▾</span>
            </button>
            <div id="predIndepth" class="pred-indepth-body">
                <div class="indepth-section">
                    <h5>🔬 Model Methodology</h5>
                    <p>This turnover prediction uses a <strong>multi-factor additive scoring model</strong> with a baseline score of 50 (moderate risk). Each organizational factor adjusts the score based on its deviation from company-wide benchmarks.</p>
                    <table class="indepth-table">
                        <tr><th>Parameter</th><th>Value</th></tr>
                        <tr><td>Baseline Score</td><td>50 (moderate risk)</td></tr>
                        <tr><td>Score Range</td><td>0 – 100 (clamped)</td></tr>
                        <tr><td>Factors Analyzed</td><td>${factors.length}</td></tr>
                        <tr><td>Risk Positive Factors</td><td style="color:#ef4444">${factors.filter(f => f.impact > 0).length} (↑ ${factors.filter(f => f.impact > 0).reduce((s,f) => s + f.impact, 0)} pts)</td></tr>
                        <tr><td>Risk Negative Factors</td><td style="color:#22c55e">${factors.filter(f => f.impact < 0).length} (↓ ${Math.abs(factors.filter(f => f.impact < 0).reduce((s,f) => s + f.impact, 0))} pts)</td></tr>
                        <tr><td>Net Adjustment</td><td style="color:${riskColor}">${riskScore > 50 ? '+' : ''}${riskScore - 50} pts from baseline</td></tr>
                        <tr><td>Final Score</td><td style="color:${riskColor};font-weight:700">${riskScore} / 100</td></tr>
                    </table>
                </div>

                <div class="indepth-section">
                    <h5>📊 Detailed Factor Analysis</h5>
                    <table class="indepth-detail-table">
                        <thead><tr><th>Factor</th><th>Impact</th><th>Detail</th><th>Direction</th></tr></thead>
                        <tbody>
                        ${factors.map(f => {
                            const dir = f.impact > 0 ? '🔴 Risk ↑' : (f.impact < 0 ? '🟢 Protective ↓' : '⚪ Neutral');
                            const sign = f.impact > 0 ? '+' : '';
                            return `<tr class="${f.impact > 0 ? 'row-risk' : (f.impact < 0 ? 'row-protect' : '')}">
                                <td><strong>${f.factor}</strong></td>
                                <td>${sign}${f.impact}</td>
                                <td>${f.detail}</td>
                                <td>${dir}</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="indepth-section">
                    <h5>📉 Statistical Context — Turnover Distribution</h5>
                    <table class="indepth-table">
                        <tr><th>Metric</th><th>Value</th></tr>
                        <tr><td>Company Mean Turnover</td><td>${avgTO.toFixed(2)}%</td></tr>
                        <tr><td>Standard Deviation</td><td>${sdTO.toFixed(2)}%</td></tr>
                        <tr><td>Selected Unit/Group Turnover</td><td>${actualRate.toFixed(2)}%</td></tr>
                        <tr><td>Z-Score (vs company)</td><td>${sdTO > 0 ? ((actualRate - avgTO) / sdTO).toFixed(2) : 'N/A'}</td></tr>
                        <tr><td>Interpretation</td><td>${sdTO > 0 ? (
                            Math.abs((actualRate - avgTO) / sdTO) < 1 ? 'Within normal range (±1 SD)' :
                            Math.abs((actualRate - avgTO) / sdTO) < 2 ? 'Moderately unusual (1–2 SD)' :
                            'Statistically unusual (>2 SD)') : '—'
                        }</td></tr>
                    </table>
                    <p class="indepth-note">The Z-score indicates how many standard deviations the selected turnover rate is from the company mean. Values beyond ±2 are statistically unusual (p &lt; .05 under normal distribution).</p>
                </div>

                <div class="indepth-section">
                    <h5>🌡️ Engagement Heatmap — Unit vs Company Average</h5>
                    <table class="indepth-heatmap">
                        <thead><tr><th>Dimension</th><th>Unit Avg</th><th>Co. Avg</th><th>Δ Diff</th><th>Status</th></tr></thead>
                        <tbody>
                        ${avgEngKeys.map(k => {
                            const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                            const uVal = unitEng[k] || 0;
                            const cVal = avgEng[k] || 0;
                            const diff = uVal - cVal;
                            const status = diff > 0.3 ? '🟢 Above Avg' : (diff < -0.3 ? '🔴 Below Avg' : '🟡 On Par');
                            const diffColor = diff > 0 ? '#22c55e' : (diff < -0.1 ? '#ef4444' : '#f59e0b');
                            return `<tr>
                                <td>${label}</td>
                                <td>${uVal.toFixed(2)}</td>
                                <td>${cVal.toFixed(2)}</td>
                                <td style="color:${diffColor};font-weight:600">${diff > 0 ? '+' : ''}${diff.toFixed(2)}</td>
                                <td>${status}</td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>

                ${mgr ? `<div class="indepth-section">
                    <h5>👔 Manager Profile Analysis</h5>
                    <table class="indepth-table">
                        <tr><th>Metric</th><th>This Manager</th><th>Company Avg</th><th>Position</th></tr>
                        <tr><td>Annual Wage</td><td>$${typeof mgr.wage === 'number' ? mgr.wage.toLocaleString() : mgr.wage}</td><td>$${Math.round(avgMgrWage).toLocaleString()}</td><td>${mgr.wage > avgMgrWage ? '🟢 Above' : '🔴 Below'} avg</td></tr>
                        <tr><td>Hourly Rate (est.)</td><td>$${(mgr.wage / 2080).toFixed(2)}</td><td>$${(avgMgrWage / 2080).toFixed(2)}</td><td>${mgr.wage > avgMgrWage ? '🟢 Above' : '🔴 Below'} avg</td></tr>
                        <tr><td>Performance Rating</td><td>${typeof mgr.perf === 'number' ? mgr.perf.toFixed(1) : mgr.perf}/5</td><td>${avgMgrPerf.toFixed(1)}/5</td><td>${mgr.perf >= avgMgrPerf ? '🟢 At/Above' : '🔴 Below'} avg</td></tr>
                        <tr><td>Experience (yrs)</td><td>${typeof mgr.exp === 'number' ? mgr.exp.toFixed(1) : mgr.exp}</td><td>${mean(D.module4.scatterManagers.map(m => m.exp)).toFixed(1)}</td><td>${mgr.exp >= mean(D.module4.scatterManagers.map(m => m.exp)) ? '🟢 At/Above' : '🟡 Below'} avg</td></tr>
                    </table>
                </div>` : ''}

                <div class="indepth-section">
                    <h5>📘 Interpretation Guide</h5>
                    <div class="indepth-guide">
                        <div class="guide-row"><span class="guide-badge" style="background:rgba(239,68,68,0.15);color:#ef4444">HIGH (65–100)</span> Immediate intervention recommended. Multiple risk factors are compounding. Review engagement programs, compensation, and management effectiveness.</div>
                        <div class="guide-row"><span class="guide-badge" style="background:rgba(245,158,11,0.15);color:#f59e0b">MEDIUM (40–64)</span> Monitor closely. Some risk factors present but manageable. Targeted improvements in weak areas can reduce risk.</div>
                        <div class="guide-row"><span class="guide-badge" style="background:rgba(34,197,94,0.15);color:#22c55e">LOW (0–39)</span> Healthy retention outlook. Continue current practices. Protective factors outweigh risks.</div>
                    </div>
                    <p class="indepth-note"><strong>Note:</strong> This model is pedagogical — designed to teach HR analytics concepts. It uses a simplified additive scoring approach rather than logistic regression or machine learning. Real-world models would incorporate individual-level data, temporal patterns, and validated instruments.</p>
                </div>
            </div>
        </div>
    `;
}

// ===== DATA DICTIONARY =====
function renderDataDictionary() {
    const container = document.getElementById('dataDictContent');
    const DICT_ENTRIES = [
        // Workforce Demographics
        { cat: 'Workforce Demographics', name: 'Unit ID', desc: 'Unique identifier for each restaurant unit/location', source: 'HRIS — Unit Roster', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Market', desc: 'Size classification of the restaurant market: Large or Medium', source: 'HRIS — Unit Roster', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Total Headcount', desc: 'Total number of currently employed individuals', source: 'HRIS — Unit Roster', type: 'Ratio' },
        { cat: 'Workforce Demographics', name: 'Age Bracket', desc: 'Age range of employee (18-25, 26-35, 36-45, 46-55, 56-65, 65+)', source: 'HRIS — Employee Records', type: 'Ordinal' },
        { cat: 'Workforce Demographics', name: 'Gender', desc: 'Employee gender classification (Male, Female)', source: 'HRIS — Employee Records', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Race', desc: 'Employee racial classification (White, URM — Under-Represented Minority)', source: 'HRIS — Employee Records', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Job Title', desc: 'Employee position (Manager, Assistant Manager, Wait staff, Bartender, etc.)', source: 'HRIS — Employee Records', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Exempt Status', desc: 'FLSA classification: Exempt (salaried) or Non-Exempt (hourly)', source: 'HRIS — Employee Records', type: 'Nominal' },
        { cat: 'Workforce Demographics', name: 'Recruitment Source', desc: 'Channel through which employee was recruited (Walk-in, Online, University, etc.)', source: 'HRIS — Recruitment Records', type: 'Nominal' },
        // Turnover & Flight Risk
        { cat: 'Turnover & Flight Risk', name: 'Employment Status', desc: 'Current status: Employed, Quit, or Discharged', source: 'HRIS — Separation Records', type: 'Nominal' },
        { cat: 'Turnover & Flight Risk', name: 'Quit Count', desc: 'Number of voluntary separations (quits) at a unit', source: 'HRIS — Separation Records', type: 'Ratio' },
        { cat: 'Turnover & Flight Risk', name: 'Discharged Count', desc: 'Number of involuntary separations (terminations) at a unit', source: 'HRIS — Separation Records', type: 'Ratio' },
        { cat: 'Turnover & Flight Risk', name: 'Turnover Rate (%)', desc: 'Percentage of employees who separated relative to total workforce', source: 'Calculated: (Quit+Discharged) / (Employed+Quit+Discharged) × 100', type: 'Ratio' },
        { cat: 'Turnover & Flight Risk', name: 'Flight Risk (Declining)', desc: 'Count of employees flagged as potential flight risks due to declining engagement', source: 'Analytics Model — Engagement Trends', type: 'Ratio' },
        { cat: 'Turnover & Flight Risk', name: 'Avg Performance by Status', desc: 'Mean performance rating grouped by employment status', source: 'HRIS — Performance Reviews', type: 'Interval' },
        // Diversity & Hiring
        { cat: 'Diversity & Hiring', name: 'Hired Count', desc: 'Number of applicants who received an offer and were hired', source: 'ATS — Applicant Tracking System', type: 'Ratio' },
        { cat: 'Diversity & Hiring', name: 'Not Hired Count', desc: 'Number of applicants who were not selected for hire', source: 'ATS — Applicant Tracking System', type: 'Ratio' },
        { cat: 'Diversity & Hiring', name: 'Hiring Rate (%)', desc: 'Percentage of applicants hired out of total applicants', source: 'Calculated: Hired / Total Applicants × 100', type: 'Ratio' },
        { cat: 'Diversity & Hiring', name: 'Interview 1 Score', desc: 'Score from first-round structured interview (scale 1-7)', source: 'ATS — Interview Evaluations', type: 'Interval' },
        { cat: 'Diversity & Hiring', name: 'Interview 2 Score', desc: 'Score from second-round structured interview (scale 1-7)', source: 'ATS — Interview Evaluations', type: 'Interval' },
        { cat: 'Diversity & Hiring', name: 'Adverse Impact Ratio', desc: 'Selection rate of protected group ÷ selection rate of majority group (4/5ths rule)', source: 'Calculated: URM Hire Rate / White Hire Rate', type: 'Ratio' },
        // Compensation & Performance
        { cat: 'Compensation & Performance', name: 'Manager Wage ($)', desc: 'Annual salary for management-level employees', source: 'HRIS — Compensation Records', type: 'Ratio' },
        { cat: 'Compensation & Performance', name: 'Performance Rating', desc: 'Supervisor-rated performance score (scale 1-5)', source: 'HRIS — Performance Reviews', type: 'Ordinal' },
        { cat: 'Compensation & Performance', name: 'Experience (Years)', desc: 'Number of years of management experience', source: 'HRIS — Employee Records', type: 'Ratio' },
        { cat: 'Compensation & Performance', name: 'Avg Wage by Performance', desc: 'Average compensation grouped by performance rating level', source: 'Calculated: Mean wage per performance tier', type: 'Ratio' },
        { cat: 'Compensation & Performance', name: 'Avg Wage by Experience', desc: 'Average compensation grouped by years of experience', source: 'Calculated: Mean wage per experience tier', type: 'Ratio' },
        { cat: 'Compensation & Performance', name: 'Avg Wage by Demographics', desc: 'Average compensation grouped by gender or race', source: 'Calculated: Mean wage per demographic group', type: 'Ratio' },
        // Engagement
        { cat: 'Engagement', name: 'Job Satisfaction', desc: 'Employee satisfaction with their role and work conditions (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Collaboration', desc: 'Perceived teamwork and cooperative work environment (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Communication', desc: 'Quality and openness of workplace communication (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Support', desc: 'Perceived managerial and organizational support (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Customer Focus', desc: 'Unit\'s orientation toward customer service excellence (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Personal Growth', desc: 'Opportunities for development and career advancement (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Inclusion', desc: 'Sense of belonging and equitable treatment (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Empowerment', desc: 'Employee autonomy and decision-making authority (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        { cat: 'Engagement', name: 'Accountability', desc: 'Clear expectations and responsibility ownership (scale 1-7)', source: 'Annual Engagement Survey', type: 'Interval' },
        // Restaurant Performance
        { cat: 'Restaurant Performance', name: 'Sales ($)', desc: 'Total gross revenue for the restaurant unit in the fiscal year', source: 'POS — Financial Records', type: 'Ratio' },
        { cat: 'Restaurant Performance', name: 'COGS ($)', desc: 'Cost of Goods Sold — direct costs of food and beverage', source: 'POS — Financial Records', type: 'Ratio' },
        { cat: 'Restaurant Performance', name: 'Payroll ($)', desc: 'Total labor cost including wages, benefits, taxes', source: 'HRIS — Payroll System', type: 'Ratio' },
        { cat: 'Restaurant Performance', name: 'Fixed Ops ($)', desc: 'Fixed operational expenses (rent, utilities, insurance)', source: 'Finance — General Ledger', type: 'Ratio' },
        { cat: 'Restaurant Performance', name: 'Profit ($)', desc: 'Net profit: Sales − COGS − Payroll − Fixed Ops', source: 'Calculated: Sales − COGS − Payroll − Fixed Ops', type: 'Ratio' },
        { cat: 'Restaurant Performance', name: 'Profit Margin (%)', desc: 'Profit as a percentage of total sales', source: 'Calculated: Profit / Sales × 100', type: 'Ratio' },
    ];

    const cats = [...new Set(DICT_ENTRIES.map(e => e.cat))];
    const typeColors = {
        'Nominal': '#a78bfa',
        'Ordinal': '#38bdf8',
        'Interval': '#34d399',
        'Ratio': '#fb923c'
    };

    container.innerHTML = `
        <div class="dd-toolbar">
            <input type="text" id="ddSearch" class="dd-search" placeholder="🔍  Search variables..." oninput="filterDataDict()">
            <div class="dd-type-legend">
                ${Object.entries(typeColors).map(([t,c]) => `<span class="dd-type-tag" style="background:${c}20;color:${c};border:1px solid ${c}50">${t}</span>`).join('')}
            </div>
        </div>
        <div id="ddTableWrap">
            ${cats.map(cat => {
                const rows = DICT_ENTRIES.filter(e => e.cat === cat);
                return `
                <div class="dd-category" data-category="${cat}">
                    <h3 class="dd-cat-title">${cat}</h3>
                    <table class="dd-table">
                        <thead>
                            <tr>
                                <th>Variable Name</th>
                                <th>Description</th>
                                <th>Source</th>
                                <th>Data Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.map(r => `
                                <tr class="dd-row" data-search="${(r.name + ' ' + r.desc + ' ' + r.source + ' ' + r.type).toLowerCase()}">
                                    <td class="dd-var-name">${r.name}</td>
                                    <td>${r.desc}</td>
                                    <td class="dd-source">${r.source}</td>
                                    <td><span class="dd-type-tag" style="background:${typeColors[r.type]}20;color:${typeColors[r.type]};border:1px solid ${typeColors[r.type]}50">${r.type}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
            }).join('')}
        </div>
        <div class="dd-footer">
            <p>📊 Total variables: <strong>${DICT_ENTRIES.length}</strong> &nbsp;|&nbsp; Categories: <strong>${cats.length}</strong></p>
        </div>
    `;
}

window.filterDataDict = function() {
    const q = document.getElementById('ddSearch').value.toLowerCase();
    document.querySelectorAll('.dd-row').forEach(row => {
        row.style.display = row.dataset.search.includes(q) ? '' : 'none';
    });
    document.querySelectorAll('.dd-category').forEach(cat => {
        const visible = cat.querySelectorAll('.dd-row[style=""],.dd-row:not([style])');
        const hidden = cat.querySelectorAll('.dd-row[style*="none"]');
        cat.style.display = (visible.length === 0 && hidden.length > 0) ? 'none' : '';
    });
};

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    renderModule('overview');
});
