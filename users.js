const ctxUsers = document.getElementById('usersChart').getContext('2d');

const usCities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami',
  'San Francisco', 'Boston', 'Seattle', 'Dallas', 'Washington D.C.',
  'Atlanta', 'Denver', 'Las Vegas', 'Orlando', 'Philadelphia'
];

function getRandomCities(count) {
  const shuffled = [...usCities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomData(cities) {
  return cities.map(() => Math.floor(Math.random() * 100) + 10);
}

const usersChart = new Chart(ctxUsers, {
  type: 'bar',
  data: {
    labels: getRandomCities(7),
    datasets: [{
      label: 'Usuários por Cidade',
      data: generateRandomData(getRandomCities(7)),
      backgroundColor: ['#8d7ef7', '#a89bff', '#b8c7ff', '#8fa5ff', '#cbb5ff', '#8e9df8', '#d4bcff'],
      borderRadius: 10,
      borderSkipped: false,
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
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
          label: (context) => `${context.parsed.y} usuários`
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
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.12)',
          drawBorder: false
        },
        ticks: {
          color: '#64748b'
        }
      }
    }
  }
});

setInterval(() => {
  const randomCities = getRandomCities(7);
  usersChart.data.labels = randomCities;
  usersChart.data.datasets[0].data = generateRandomData(randomCities);
  usersChart.update();
}, 5000);
