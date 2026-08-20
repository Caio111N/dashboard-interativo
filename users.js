// Seleciona o elemento <canvas> do gráfico de usuários
const ctxUsers = document.getElementById('usersChart').getContext('2d');

// Lista de cidades conhecidas nos EUA
const usCities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Miami",
  "San Francisco", "Boston", "Seattle", "Dallas", "Washington D.C.",
  "Atlanta", "Denver", "Las Vegas", "Orlando", "Philadelphia"
];

// Função para sortear cidades aleatórias
function getRandomCities(count) {
  const shuffled = [...usCities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Função para gerar valores aleatórios
function generateRandomData(cities) {
  return cities.map(() => Math.floor(Math.random() * 100) + 10); 
  // valores entre 10 e 110
}

// Cria o gráfico de usuários
const usersChart = new Chart(ctxUsers, {
  type: 'bar',
  data: {
    labels: getRandomCities(7), // começa com 7 cidades aleatórias
    datasets: [{
      label: 'Usuários por Cidade',
      data: generateRandomData(getRandomCities(7)),
      backgroundColor: '#e94e77'
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
setInterval(() => {
  const randomCities = getRandomCities(7); // sorteia novas cidades
  usersChart.data.labels = randomCities;
  usersChart.data.datasets[0].data = generateRandomData(randomCities);
  usersChart.update();
}, 5000);
