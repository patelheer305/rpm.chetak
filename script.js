// Initialize Chart.js
const ctx = document.getElementById('rpmChart').getContext('2d');
const rpmChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'RPM',
      data: [],
      borderColor: '#007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Time' } },
      y: { title: { display: true, text: 'RPM' }, beginAtZero: true }
    }
  }
});

// Fetch RPM data from Glitch
async function fetchRPM() {
  try {
    console.log('Fetching data from: https://your-project.glitch.me/rpm');
    const response = await fetch('https://your-project.glitch.me/rpm');
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received data:', data);

    // Update current RPM
    const latestRPM = data.length > 0 ? data[data.length - 1].rpm : 0;
    document.getElementById('current-rpm').textContent = `${latestRPM} RPM`;

    // Update chart
    rpmChart.data.labels = data.map(d => new Date(d.timestamp).toLocaleTimeString());
    rpmChart.data.datasets[0].data = data.map(d => parseFloat(d.rpm));
    rpmChart.update();
  } catch (error) {
    console.error('Error fetching RPM data:', error);
    document.getElementById('current-rpm').textContent = 'Error';
  }
}

// Fetch data initially and every 5 seconds
fetchRPM();
setInterval(fetchRPM, 5000);
