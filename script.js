const ctx = document.getElementById('rpmChart').getContext('2d');
const rpmChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'RPM',
      data: [],
      borderColor: '#d70000',
      backgroundColor: 'rgba(215, 0, 0, 0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { grid: { display: true, drawBorder: true }, ticks: { display: false }, title: { display: true, text: 'Time' } },
      y: { grid: { display: true, drawBorder: true }, ticks: { display: false }, title: { display: true, text: 'RPM' } }
    },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  }
});

let userId = null;
let devices = [];

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://exciting-amusing-stork.glitch.me/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    console.log('Login response status:', response.status);
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    const data = await response.json();
    userId = data.userId;
    devices = data.devices;

    // Hide login and show RPM container
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('rpm-container').style.display = 'block';

    // Populate device dropdown
    const deviceSelect = document.getElementById('device-select');
    deviceSelect.innerHTML = devices.map(device => <option value="${device}">${device}</option>).join('');
    fetchRPM(devices[0]); // Load first device's data
  } catch (error) {
    console.error('Login error:', error);
    alert('Invalid username or password');
  }
});

async function fetchRPM(deviceId) {
  try {
    const url = 'https://exciting-amusing-stork.glitch.me/rpm?userId=${userId}&deviceId=${deviceId}';
    console.log('Fetching data from: ' + url);
    const response = await fetch(url);
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(HTTP error! Status: ${response.status});
    }
    const data = await response.json();
    console.log('Received data:', data);

    // Update current RPM
    const latestRPM = data.length > 0 ? data[data.length - 1].rpm : "0";
    document.getElementById('current-rpm').textContent = ${latestRPM} RPM;

    // Update chart
    rpmChart.data.labels = data.map(d => '');
    rpmChart.data.datasets[0].data = data.map(d => parseFloat(d.rpm));
    rpmChart.update();
  } catch (error) {
    console.error('Error fetching RPM data:', error);
    document.getElementById('current-rpm').textContent = 'Error';
  }
}

// Periodic update
setInterval(() => {
  const selectedDevice = document.getElementById('device-select').value;
  if (selectedDevice && userId) {
    fetchRPM(selectedDevice);
  }
}, 5000);

// Device selection
document.getElementById('device-select').addEventListener('change', (e) => {
  fetchRPM(e.target.value);
});
