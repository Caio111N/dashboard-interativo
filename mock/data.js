const cityCatalog = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba',
  'Salvador', 'Fortaleza', 'Porto Alegre', 'Recife', 'Brasília', 'Campinas'
];

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildSeries(length, base, amplitude, phase = 0) {
  return Array.from({ length }, (_, index) => {
    const value = base + Math.sin(index * 0.9 + phase) * amplitude + (index % 4) * 14;
    return Math.round(value);
  });
}

function buildSalesSeries(period, previousOffset = 0.88) {
  const lengths = {
    '7d': 7,
    '30d': 30,
    '6m': 6,
    year: 12
  };

  const labels = period === '7d'
    ? weekLabels
    : period === '30d'
      ? Array.from({ length: 30 }, (_, index) => `Dia ${index + 1}`)
      : period === '6m'
        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
        : monthNames;

  const current = buildSeries(labels.length, 2200, 900, 1.3);
  const previous = current.map((value, index) => Math.round(value * previousOffset + Math.sin(index + 2) * 110));

  return {
    labels,
    current,
    previous,
    detail: labels.map((label, index) => ({
      label,
      total: current[index],
      previous: previous[index],
      users: Math.max(40, Math.round(current[index] / 14 + index * 4)),
      temperature: 20 + ((index * 2.2) % 11)
    }))
  };
}

function buildUsersByCity(cityFilter) {
  const cityData = cityCatalog.map((city, index) => ({
    city,
    value: 120 + index * 18 + Math.round(Math.random() * 90)
  }));

  if (cityFilter && cityFilter !== 'all') {
    const match = cityData.find((item) => item.city === cityFilter);
    return match ? [{ city: match.city, value: match.value }] : [];
  }

  return cityData.sort((a, b) => b.value - a.value).slice(0, 7);
}

function buildTemperatureSeries(period) {
  const labels = period === '7d'
    ? weekLabels
    : period === '30d'
      ? Array.from({ length: 30 }, (_, index) => `Dia ${index + 1}`)
      : period === '6m'
        ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
        : monthNames;

  return {
    labels,
    values: labels.map((_, index) => clamp(Math.round(22 + Math.sin(index * 0.8) * 8 + (index % 3) * 1.8), 18, 33))
  };
}

export function calculateTrend(current, previous) {
  if (!previous) {
    return 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export function buildCsv(snapshot) {
  const rows = [['Mes', 'Vendas', 'Ano anterior', 'Usuários', 'Temperatura']];

  const sales = snapshot?.sales?.detail ?? [];
  sales.forEach((entry) => {
    rows.push([
      entry.label,
      entry.total,
      entry.previous,
      entry.users,
      `${entry.temperature}°C`
    ]);
  });

  return rows.map((row) => row.join(',')).join('\n');
}

export function getCityOptions() {
  return ['all', ...cityCatalog];
}

/**
 * Centraliza a contract de dados do dashboard para simular a camada de serviço
 * que normalmente consumiria um endpoint real em produção.
 */
export function buildDashboardSnapshot({ period = '30d', city = 'all', compare = false } = {}) {
  const salesSeries = buildSalesSeries(period);
  const temperatureSeries = buildTemperatureSeries(period);
  const userSeries = buildUsersByCity(city);

  const totalSales = salesSeries.current.reduce((sum, value) => sum + value, 0);
  const totalPreviousSales = salesSeries.previous.reduce((sum, value) => sum + value, 0);
  const avgTemperature = temperatureSeries.values.reduce((sum, value) => sum + value, 0) / temperatureSeries.values.length;
  const totalUsers = userSeries.reduce((sum, item) => sum + item.value, 0);

  return {
    period,
    city,
    compare,
    summary: {
      sales: {
        total: totalSales,
        previous: totalPreviousSales,
        trend: calculateTrend(totalSales, totalPreviousSales),
        label: 'Vendas'
      },
      users: {
        total: totalUsers,
        previous: totalUsers * 0.9,
        trend: calculateTrend(totalUsers, totalUsers * 0.9),
        label: 'Usuários'
      },
      weather: {
        total: Number(avgTemperature.toFixed(1)),
        previous: Number((avgTemperature * 0.97).toFixed(1)),
        trend: calculateTrend(avgTemperature, avgTemperature * 0.97),
        label: 'Temperatura média'
      }
    },
    sales: {
      labels: salesSeries.labels,
      current: salesSeries.current,
      previous: salesSeries.previous,
      detail: salesSeries.detail,
      comparison: compare ? {
        currentLabel: 'Este período',
        previousLabel: 'Período anterior'
      } : null
    },
    users: {
      labels: userSeries.map((item) => item.city),
      values: userSeries.map((item) => item.value),
      city
    },
    weather: {
      labels: temperatureSeries.labels,
      values: temperatureSeries.values
    },
    meta: {
      generatedAt: new Date().toISOString(),
      title: 'Dashboard de performance'
    }
  };
}

export function fetchDashboardData({ period = '30d', city = 'all', compare = false, simulateError = false } = {}) {
  return new Promise((resolve, reject) => {
    const delay = 700 + Math.random() * 900;

    setTimeout(() => {
      if (simulateError) {
        reject(new Error('Falha ao carregar dados do dashboard.'));
        return;
      }

      resolve(buildDashboardSnapshot({ period, city, compare }));
    }, delay);
  });
}
