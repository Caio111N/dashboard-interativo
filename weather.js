// Seleciona o elemento <canvas> do gráfico de clima
const ctxWeather = document.getElementById('weatherChart').getContext('2d');

// Função para gerar dados simulados de temperatura
function generateWeatherData() {
  const hours = ["06:00", "10:00", "14:00", "18:00", "22:00", "00:00"];
  const temps = hours.map(() => Math.floor(Math.random() * 15) + 18); 
  // valores entre 18°C e 33°C
  return { hours, temps };
}

// Cria o gráfico de temperatura
const weatherChart = new Chart(ctxWeather, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [],
      borderColor: '#4a90e2',
      fill: false
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  }
});

// Atualiza os dados a cada 5 segundos
function updateWeatherChart() {
  const { hours, temps } = generateWeatherData();
  weatherChart.data.labels = hours;
  weatherChart.data.datasets[0].data = temps;
  weatherChart.update();
}

// Inicializa com dados simulados
updateWeatherChart();

// Atualiza automaticamente a cada 5 segundos
setInterval(updateWeatherChart, 5000);
