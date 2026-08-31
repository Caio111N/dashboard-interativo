import {
  buildCsv,
  fetchDashboardData,
  formatCompactNumber,
  formatCurrency,
  getCityOptions
} from './mock/data.js';

const state = {
  period: '30d',
  city: 'all',
  compare: false,
  selectedKpi: 'sales',
  theme: localStorage.getItem('theme') === 'dark' ? 'dark' : 'light',
  data: null,
  loading: false,
  error: '',
  charts: {
    sales: null,
    users: null,
    weather: null
  }
};

const refs = {
  body: document.body,
  themeButton: document.getElementById('toggleTheme'),
  toggleText: document.querySelector('.theme-text'),
  toggleIcon: document.querySelector('.theme-icon'),
  periodSelect: document.getElementById('periodSelect'),
  citySelect: document.getElementById('citySelect'),
  comparisonToggle: document.getElementById('comparisonToggle'),
  refreshButton: document.getElementById('refreshDataBtn'),
  simulateErrorButton: document.getElementById('simulateErrorBtn'),
  exportCsvButton: document.getElementById('exportCsvBtn'),
  exportPngButton: document.getElementById('exportPngBtn'),
  shareButton: document.getElementById('shareBtn'),
  shortcutsPanel: document.getElementById('shortcutsPanel'),
  toggleShortcutsButton: document.getElementById('toggleShortcutsBtn'),
  detailModal: document.getElementById('detailModal'),
  detailModalBody: document.getElementById('detailModalBody'),
  closeModalButton: document.getElementById('closeModalBtn'),
  errorState: document.getElementById('errorState'),
  loadingState: document.getElementById('loadingState'),
  kpiCards: document.querySelectorAll('.kpi-card'),
  chartCards: document.querySelectorAll('.chart-card')
};

const palette = {
  light: {
    grid: 'rgba(148, 163, 184, 0.14)',
    axis: '#64748b',
    tooltipBg: 'rgba(15, 23, 42, 0.9)',
    sales: ['#5b74f2', '#7d8ef4', '#93a5ff', '#7189ef', '#8ea1ff', '#6d7fe9'],
    users: ['#8d7ef7', '#a89bff', '#b8c7ff', '#8fa5ff', '#cbb5ff', '#8e9df8', '#d4bcff'],
    weather: '#4bb79d'
  },
  dark: {
    grid: 'rgba(148, 163, 184, 0.16)',
    axis: '#9fb3c9',
    tooltipBg: 'rgba(15, 23, 42, 0.92)',
    sales: ['#8bb0ff', '#a7bffb', '#c5d5ff', '#7b9cff', '#90a6ff', '#ccd7ff'],
    users: ['#b5aeff', '#d4caff', '#c7d3ff', '#98aaf8', '#d7dcff', '#b7c6ff', '#edd8ff'],
    weather: '#76d5b8'
  }
};

function debounce(fn, wait = 180) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  };
}

function formatSignedTrend(value) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

function applyTheme(themeName = state.theme) {
  const isDark = themeName === 'dark';
  refs.body.classList.toggle('dark', isDark);
  refs.toggleText.textContent = isDark ? 'Light' : 'Dark';
  refs.toggleIcon.textContent = isDark ? '☀️' : '🌙';
  refs.themeButton.setAttribute('aria-label', isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro');
  localStorage.setItem('theme', themeName);
  state.theme = themeName;

  const activePalette = palette[themeName];
  if (state.charts.sales) {
    state.charts.sales.data.datasets[0].backgroundColor = activePalette.sales;
    state.charts.sales.options.scales.x.grid.color = activePalette.grid;
    state.charts.sales.options.scales.y.grid.color = activePalette.grid;
    state.charts.sales.options.scales.x.ticks.color = activePalette.axis;
    state.charts.sales.options.scales.y.ticks.color = activePalette.axis;
    state.charts.sales.options.plugins.tooltip.backgroundColor = activePalette.tooltipBg;
    state.charts.sales.update();
  }

  if (state.charts.users) {
    state.charts.users.data.datasets[0].backgroundColor = activePalette.users;
    state.charts.users.options.scales.x.grid.color = activePalette.grid;
    state.charts.users.options.scales.y.grid.color = activePalette.grid;
    state.charts.users.options.scales.x.ticks.color = activePalette.axis;
    state.charts.users.options.scales.y.ticks.color = activePalette.axis;
    state.charts.users.options.plugins.tooltip.backgroundColor = activePalette.tooltipBg;
    state.charts.users.update();
  }

  if (state.charts.weather) {
    state.charts.weather.data.datasets[0].borderColor = activePalette.weather;
    const gradient = state.charts.weather.ctx.createLinearGradient(0, 0, 0, state.charts.weather.canvas.height);
    gradient.addColorStop(0, isDark ? 'rgba(118, 213, 184, 0.42)' : 'rgba(75, 183, 157, 0.25)');
    gradient.addColorStop(1, isDark ? 'rgba(118, 213, 184, 0.04)' : 'rgba(75, 183, 157, 0.04)');
    state.charts.weather.data.datasets[0].backgroundColor = gradient;
    state.charts.weather.options.scales.x.grid.color = activePalette.grid;
    state.charts.weather.options.scales.y.grid.color = activePalette.grid;
    state.charts.weather.options.scales.x.ticks.color = activePalette.axis;
    state.charts.weather.options.scales.y.ticks.color = activePalette.axis;
    state.charts.weather.options.plugins.tooltip.backgroundColor = activePalette.tooltipBg;
    state.charts.weather.update();
  }
}

function setLoading(isLoading) {
  state.loading = isLoading;
  refs.loadingState.classList.toggle('hidden', !isLoading);
}

function showError(message) {
  state.error = message;
  refs.errorState.textContent = message;
  refs.errorState.classList.remove('hidden');
}

function hideError() {
  refs.errorState.classList.add('hidden');
  state.error = '';
}

function renderKpis(snapshot) {
  const salesTrend = snapshot.summary.sales.trend;
  const usersTrend = snapshot.summary.users.trend;
  const weatherTrend = snapshot.summary.weather.trend;

  document.getElementById('kpiSales').textContent = formatCurrency(snapshot.summary.sales.total);
  document.getElementById('kpiUsers').textContent = formatCompactNumber(snapshot.summary.users.total);
  document.getElementById('kpiWeather').textContent = `${snapshot.summary.weather.total.toFixed(1)}°C`;

  configureTrend('sales', salesTrend);
  configureTrend('users', usersTrend);
  configureTrend('weather', weatherTrend);
}

function configureTrend(key, value) {
  const element = document.getElementById(`trend${key.charAt(0).toUpperCase() + key.slice(1)}`);
  const isPositive = value >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const cssClass = isPositive ? 'positive' : 'negative';

  element.classList.remove('positive', 'negative');
  element.classList.add(cssClass);
  element.innerHTML = `<span class="trend-arrow" aria-hidden="true">${arrow}</span> ${formatSignedTrend(value)} vs período anterior`;
}

function updateCityOptions() {
  const options = getCityOptions();
  refs.citySelect.innerHTML = options
    .map((city) => `<option value="${city}">${city === 'all' ? 'Todas as cidades' : city}</option>`)
    .join('');
  refs.citySelect.value = state.city;
}

function updateSelectionState() {
  refs.kpiCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.kpi === state.selectedKpi);
  });

  refs.chartCards.forEach((card) => {
    card.classList.toggle('active', card.dataset.chart === state.selectedKpi);
  });
}

function hideAllEmptyStates() {
  document.querySelectorAll('.empty-state').forEach((node) => node.classList.add('hidden'));
}

function setEmptyState(chartKey, isEmpty) {
  const target = document.getElementById(`${chartKey}EmptyState`);
  if (target) {
    target.classList.toggle('hidden', !isEmpty);
  }
}

function closeModal() {
  refs.detailModal.classList.add('hidden');
}

function openModalWithDetail(detail) {
  refs.detailModalBody.innerHTML = `
    <div class="detail-list">
      <div class="detail-item"><strong>Período</strong><span>${detail.label}</span></div>
      <div class="detail-item"><strong>Vendas</strong><span>${formatCurrency(detail.total)}</span></div>
      <div class="detail-item"><strong>Ano anterior</strong><span>${formatCurrency(detail.previous)}</span></div>
      <div class="detail-item"><strong>Usuários</strong><span>${detail.users}</span></div>
      <div class="detail-item"><strong>Temperatura</strong><span>${detail.temperature}°C</span></div>
    </div>
  `;
  refs.detailModal.classList.remove('hidden');
}

/**
 * Constrói a configuração de cada gráfico com um padrão visual consistente.
 * Isso isola a lógica de desenho do estado da aplicação e facilita manutenção.
 */
function buildInitialConfig(chartKey, snapshot) {
  const isDark = state.theme === 'dark';
  const activePalette = palette[state.theme];
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutCubic' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: activePalette.tooltipBg,
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            if (chartKey === 'sales') return `R$ ${context.parsed.y.toLocaleString('pt-BR')}`;
            if (chartKey === 'users') return `${context.parsed.y} usuários`;
            return `${context.parsed.y}°C`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, color: activePalette.grid },
        ticks: { color: activePalette.axis }
      },
      y: {
        grid: { color: activePalette.grid, drawBorder: false },
        ticks: { color: activePalette.axis }
      }
    }
  };

  if (chartKey === 'sales') {
    return {
      type: 'bar',
      data: {
        labels: snapshot.sales.labels,
        datasets: [
          {
            label: 'Vendas',
            data: snapshot.sales.current,
            backgroundColor: activePalette.sales,
            borderRadius: 12,
            borderSkipped: false
          }
        ]
      },
      options: {
        ...commonOptions,
        onClick: (_, elements) => {
          if (!elements.length) return;
          const itemIndex = elements[0].index;
          const detail = snapshot.sales.detail[itemIndex];
          openModalWithDetail(detail);
        }
      }
    };
  }

  if (chartKey === 'users') {
    return {
      type: 'bar',
      data: {
        labels: snapshot.users.labels,
        datasets: [{
          label: state.city === 'all' ? 'Usuários por cidade' : state.city,
          data: snapshot.users.values,
          backgroundColor: activePalette.users,
          borderRadius: 12,
          borderSkipped: false
        }]
      },
      options: commonOptions
    };
  }

  const gradient = document.getElementById('weatherChart').getContext('2d').createLinearGradient(0, 0, 0, 320);
  gradient.addColorStop(0, isDark ? 'rgba(118, 213, 184, 0.42)' : 'rgba(75, 183, 157, 0.25)');
  gradient.addColorStop(1, isDark ? 'rgba(118, 213, 184, 0.04)' : 'rgba(75, 183, 157, 0.04)');

  return {
    type: 'line',
    data: {
      labels: snapshot.weather.labels,
      datasets: [{
        label: 'Temperatura',
        data: snapshot.weather.values,
        borderColor: activePalette.weather,
        backgroundColor: gradient,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: activePalette.weather,
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: commonOptions
  };
}

function buildComparisonChart(chartKey, snapshot) {
  if (chartKey !== 'sales' || !state.compare) {
    return null;
  }

  const canvas = document.getElementById('salesChart');
  const context = canvas.getContext('2d');
  const activePalette = palette[state.theme];

  const config = {
    type: 'bar',
    data: {
      labels: snapshot.sales.labels,
      datasets: [
        {
          label: 'Este período',
          data: snapshot.sales.current,
          backgroundColor: activePalette.sales,
          borderRadius: 10,
          borderSkipped: false
        },
        {
          label: 'Período anterior',
          data: snapshot.sales.previous,
          backgroundColor: 'rgba(148, 163, 184, 0.52)',
          borderRadius: 10,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700, easing: 'easeOutCubic' },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'top' },
        tooltip: {
          backgroundColor: activePalette.tooltipBg,
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context) => `R$ ${context.parsed.y.toLocaleString('pt-BR')}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false, color: activePalette.grid },
          ticks: { color: activePalette.axis }
        },
        y: {
          grid: { color: activePalette.grid, drawBorder: false },
          ticks: { color: activePalette.axis, callback: (value) => `R$ ${value}` }
        }
      },
      onClick: (_, elements) => {
        if (!elements.length) return;
        const itemIndex = elements[0].index;
        const detail = snapshot.sales.detail[itemIndex];
        openModalWithDetail(detail);
      }
    }
  };

  return new Chart(context, config);
}

function renderChart(chartKey, snapshot) {
  const canvas = document.getElementById(`${chartKey}Chart`);
  if (!canvas || !snapshot) return;

  if (state.charts[chartKey]) {
    state.charts[chartKey].destroy();
  }

  const config = chartKey === 'sales' && state.compare ? buildComparisonChart(chartKey, snapshot) : buildInitialConfig(chartKey, snapshot);

  if (chartKey === 'sales' && state.compare) {
    state.charts.sales = config;
    return;
  }

  state.charts[chartKey] = new Chart(canvas, config);
}

function renderVisibleCharts(snapshot) {
  refs.chartCards.forEach((card) => {
    const key = card.dataset.chart;
    if (state.charts[key]) return;
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight + 220 && rect.bottom > 0) {
      renderChart(key, snapshot);
    }
  });
}

function renderDashboard(snapshot) {
  renderKpis(snapshot);
  updateSelectionState();
  hideAllEmptyStates();
  renderVisibleCharts(snapshot);
  setEmptyState('sales', !snapshot.sales.labels.length);
  setEmptyState('users', !snapshot.users.labels.length);
  setEmptyState('weather', !snapshot.weather.labels.length);
  applyTheme(state.theme);
}

async function loadDashboardData({ simulateError = false, refresh = false } = {}) {
  setLoading(true);
  hideError();

  try {
    const response = await fetchDashboardData({
      period: state.period,
      city: state.city,
      compare: state.compare,
      simulateError
    });

    state.data = response;
    renderDashboard(response);
    if (refresh) {
      document.body.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(1.01)', opacity: 1 },
          { transform: 'scale(1)', opacity: 1 }
        ],
        { duration: 500, easing: 'ease-out' }
      );
    }
  } catch (error) {
    showError(error.message || 'Não foi possível carregar os dados do dashboard.');
  } finally {
    setLoading(false);
  }
}

function handleFilterChange() {
  state.period = refs.periodSelect.value;
  state.city = refs.citySelect.value;
  state.compare = refs.comparisonToggle.checked;
  loadDashboardData();
}

function handleKpiSelection(kpiName) {
  state.selectedKpi = kpiName;
  updateSelectionState();
  const chartCard = document.querySelector(`.chart-card[data-chart="${kpiName}"]`);
  if (chartCard) {
    chartCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function exportCsv() {
  if (!state.data) return;
  const csvContent = buildCsv(state.data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'dashboard-dados.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

async function exportCurrentChartImage() {
  const selectedChart = state.selectedKpi ? document.getElementById(`${state.selectedKpi}Chart`) : null;

  if (!selectedChart && window.html2canvas) {
    const canvas = await window.html2canvas(document.querySelector('.page-shell'));
    const link = document.createElement('a');
    link.download = 'dashboard-portfolio.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    return;
  }

  if (selectedChart) {
    const link = document.createElement('a');
    link.download = `${state.selectedKpi}-chart.png`;
    link.href = selectedChart.toDataURL('image/png');
    link.click();
  }
}

async function shareSummary() {
  const summaryText = `Dashboard interativo • Vendas: ${formatCurrency(state.data.summary.sales.total)} • Usuários: ${formatCompactNumber(state.data.summary.users.total)} • Temperatura média: ${state.data.summary.weather.total.toFixed(1)}°C`;

  try {
    await navigator.clipboard.writeText(summaryText);
    showError('Resumo copiado para a área de transferência.');
    setTimeout(() => hideError(), 1800);
  } catch (error) {
    showError('Não foi possível copiar automaticamente. Copie o resumo manualmente.');
  }
}

function toggleShortcuts() {
  const shouldShow = refs.shortcutsPanel.classList.toggle('hidden');
  refs.toggleShortcutsButton.setAttribute('aria-expanded', String(!shouldShow));
}

function bindEvents() {
  refs.periodSelect.addEventListener('change', debounce(handleFilterChange));
  refs.citySelect.addEventListener('change', debounce(handleFilterChange));
  refs.comparisonToggle.addEventListener('change', debounce(handleFilterChange));

  refs.kpiCards.forEach((card) => {
    card.addEventListener('click', () => handleKpiSelection(card.dataset.kpi));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleKpiSelection(card.dataset.kpi);
      }
    });
  });

  refs.themeButton.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  refs.refreshButton.addEventListener('click', () => loadDashboardData({ refresh: true }));
  refs.simulateErrorButton.addEventListener('click', () => loadDashboardData({ simulateError: true }));
  refs.exportCsvButton.addEventListener('click', exportCsv);
  refs.exportPngButton.addEventListener('click', exportCurrentChartImage);
  refs.shareButton.addEventListener('click', shareSummary);
  refs.toggleShortcutsButton.addEventListener('click', toggleShortcuts);
  refs.closeModalButton.addEventListener('click', closeModal);
  refs.detailModal.addEventListener('click', (event) => {
    if (event.target === refs.detailModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'd') {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    }
    if (key === 'r') {
      loadDashboardData({ refresh: true });
    }
    if (key === '?') {
      toggleShortcuts();
    }
    if (key === 'escape') {
      closeModal();
      refs.shortcutsPanel.classList.add('hidden');
    }
  });

  document.querySelectorAll('.help-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  });
}

function initViewportObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const chartKey = entry.target.dataset.chart;
      if (chartKey && state.data && !state.charts[chartKey]) {
        renderChart(chartKey, state.data);
      }
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '180px' });

  refs.chartCards.forEach((card) => observer.observe(card));
  if (state.data) {
    renderVisibleCharts(state.data);
  }
}

function init() {
  updateCityOptions();
  bindEvents();
  applyTheme(state.theme);
  initViewportObserver();
  loadDashboardData();

  window.addEventListener('load', () => {
    setTimeout(() => refs.body.classList.add('is-ready'), 200);
  });
}

init();
