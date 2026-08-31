const ctxWeather = document.getElementById('weatherChart').getContext('2d');

function generateWeatherData() {
  const hours = ['06:00', '10:00', '14:00', '18:00', '22:00', '00:00'];
  const temps = hours.map(() => Math.floor(Math.random() * 15) + 18);
  return { hours, temps };
}

function setWeatherAreaGradient() {
  const isDark = document.body.classList.contains('dark');
  const gradient = ctxWeather.createLinearGradient(0, 0, 0, ctxWeather.canvas.height);
  gradient.addColorStop(0, isDark ? 'rgba(118, 213, 184, 0.45)' : 'rgba(75, 183, 157, 0.28)');
  gradient.addColorStop(1, isDark ? 'rgba(118, 213, 184, 0.02)' : 'rgba(75, 183, 157, 0.02)');
  weatherChart.data.datasets[0].backgroundColor = gradient;
  weatherChart.data.datasets[0].borderColor = isDark ? '#76d5b8' : '#4bb79d';
}

const weatherChart = new Chart(ctxWeather, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [],
      borderColor: '#4bb79d',
      backgroundColor: 'rgba(75, 183, 157, 0.18)',
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 5,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#4bb79d',
      pointBorderWidth: 2,
      tension: 0.38,
      fill: true
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    animation: {
      duration: 700,
      easing: 'easeOutCubic'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.25)',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y}°C`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          callback: (value) => `${value}°`
        }
      }
    }
  }
});

function updateWeatherChart() {
  const { hours, temps } = generateWeatherData();
  weatherChart.data.labels = hours;
  weatherChart.data.datasets[0].data = temps;
  setWeatherAreaGradient();
  weatherChart.update();
}

updateWeatherChart();
setInterval(updateWeatherChart, 5000);
