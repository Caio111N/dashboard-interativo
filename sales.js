// Seleciona o elemento <canvas> do gráfico de vendas
const ctxSales = document.getElementById('salesChart').getContext('2d');

// Meses fixos
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

// Função para gerar valores aleatórios de vendas
function generateSalesData() {
  return months.map(() => Math.floor(Math.random() * 4000) + 500); 
  // valores entre 500 e 4500
}

// Cria o gráfico de vendas
const salesChart = new Chart(ctxSales, {
  type: 'bar',
  data: {
    labels: months,
    datasets: [{
      label: 'Vendas (R$)',
      data: generateSalesData(),
      backgroundColor: '#4a90e2'
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
  salesChart.data.datasets[0].data = generateSalesData();
  salesChart.update();
}, 5000);
