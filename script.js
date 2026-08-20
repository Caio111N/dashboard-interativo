/* Atualizar KPI de Vendas */
function updateSalesKPI() {
  const salesData = salesChart.data.datasets[0].data;
  const totalSales = salesData.reduce((a, b) => a + b, 0);
  document.getElementById('kpiSales').textContent = `R$ ${totalSales}`;
}

/* Atualizar KPI de Usuários */
async function fetchUserData() {
  const response = await fetch('https://jsonplaceholder.typicode.com/users');
  const users = await response.json();

  const cityCount = {};
  users.forEach(user => {
    cityCount[user.address.city] = (cityCount[user.address.city] || 0) + 1;
  });

  usersChart.data.labels = Object.keys(cityCount);
  usersChart.data.datasets[0].data = Object.values(cityCount);
  usersChart.update();

  document.getElementById('kpiUsers').textContent = users.length;
}
fetchUserData();

/* Atualizar KPI de Temperatura */
function updateWeatherKPI() {
  const temps = weatherChart.data.datasets[0].data;
  if (temps.length > 0) {
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    document.getElementById('kpiWeather').textContent = `${avgTemp}°C`;
  }
}

/* Alternar Tema */
const toggleBtn = document.getElementById('toggleTheme');
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark');
    toggleBtn.textContent = '☀️ Light';
    salesChart.data.datasets[0].backgroundColor = '#3498db';
    usersChart.data.datasets[0].backgroundColor = '#ff4757';
    weatherChart.data.datasets[0].borderColor = '#00ff7f';
  } else {
    document.body.classList.remove('dark');
    toggleBtn.textContent = '🌙 Dark';
    salesChart.data.datasets[0].backgroundColor = '#4a90e2';
    usersChart.data.datasets[0].backgroundColor = '#e94e77';
    weatherChart.data.datasets[0].borderColor = '#2ecc71';
  }
  salesChart.update();
  usersChart.update();
  weatherChart.update();
}

const savedTheme = localStorage.getItem('theme') === 'dark';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  applyTheme(isDark);
});

/* Atualizar KPIs periodicamente */
setInterval(() => {
  updateSalesKPI();
  updateWeatherKPI();
}, 5000);
