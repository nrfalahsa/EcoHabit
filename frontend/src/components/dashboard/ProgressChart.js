import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ProgressChart({ chartData = [] }) {
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  
  const chartDataPoints = last7Days.map(date => {
    const dayData = chartData.find(d => d.date === date);
    return dayData ? dayData.points : 0;
  });

  const data = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleString('id-ID', { weekday: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Poin Harian',
      data: chartDataPoints,
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#4CAF50'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="card">
      <h2 className="card-title">Statistik Poin Mingguan</h2>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default ProgressChart;