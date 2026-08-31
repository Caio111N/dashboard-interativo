const ctxSales = document.getElementById('salesChart').getContext('2d');
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

function generateSalesData() {
  return months.map(() => Math.floor(Math.random() * 4000) + 500);
}

const salesChart = new Chart(ctxSales, {
  type: 'bar',
  data: {
    labels: months,
    datasets: [{
      label: 'Vendas (R$)',
      data: generateSalesData(),
      borderRadius: 10,
      borderSkipped: false,
      borderWidth: 0,
      backgroundColor: ['#5b74f2', '#7d8ef4', '#93a5ff', '#7189ef', '#8ea1ff', '#6d7fe9']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeOutCubic'
    },
    interaction: {
      mode: 'index',
      intersect: false
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
          label: (context) => `R$ ${context.parsed.y.toLocaleString('pt-BR')}`
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
          color: '#64748b',
          callback: (value) => `R$ ${value}`
        }
      }
    }
  }
});

setInterval(() => {
  salesChart.data.datasets[0].data = generateSalesData();
  salesChart.update();
}, 5000);
