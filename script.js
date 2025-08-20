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
      x: { grid: { display: true, drawBorder: true }, ticks: { display: false }, title: { display: true, text: 'Seconds Ago' } },
      y: { grid: { display: true, drawBorder: true }, ticks: { display: false }, title: { display: true, text: 'RPM' } }
    },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  }
});

const gaugeOptions = {
  angle: 0.15,
  lineWidth: 0.44,
  radiusScale: 1,
  pointer: { length: 0.6, strokeWidth: 0.035, color: '#000000' },
  limitMax: true,
  limitMin: true,
  strokeColor: '#E0E0E0',
  generateGradient: true,
  highDpiSupport: true,
  staticZones: [
    { strokeStyle: "#FF0000", min: 0, max: 200 },
    { strokeStyle: "#FFFF00", min: 200, max: 600 },
    { strokeStyle: "#00FF00", min: 600, max: 1000 }
  ],
  staticLabels: { font: "10px sans-serif", labels: [0, 200, 600, 1000], fractionDigits: 0 }
};

const fanGauge1 = new Gauge(document.getElementById('fanGauge1')).setOptions({ ...gaugeOptions, colorStart: '#0000d7', colorStop: '#0000d7' });
const fanGauge2 = new Gauge(document.getElementById('fanGauge2')).setOptions({ ...gaugeOptions, colorStart: '#00d700', colorStop: '#00d700' });
const fanGauge3 = new Gauge(document.getElementById('fanGauge3')).setOptions({ ...gaugeOptions, colorStart: '#d700d7', colorStop: '#d700d7' });
const fanGauge4 = new Gauge(document.getElementById('fanGauge4')).setOptions({ ...gaugeOptions, colorStart: '#d7d700', colorStop: '#d7d700' });

[fanGauge1, fanGauge2, fanGauge3, fanGauge4].forEach(gauge => {
  gauge.maxValue = 1000; // Max RPM
  gauge.setMinValue(0);
  gauge.set(0);
});

let userId = null;
let deviceId = null;
let isDualShaft = false;

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://chetak-backend.vercel.app/login', { // Replace with confirmed Vercel URL
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    console.log('Login response status:', response.status);
    const data = await response.json();
    console.log('Login response data:', data);
    if (!response.ok) {
      throw new Error(`Login failed: ${data.error || 'Unknown error'}`);
    }
    userId = data.userId;
    deviceId = data.devices && data.devices[0];
    console.log('User ID:', userId, 'Device ID:', deviceId);
    if (!userId || !deviceId) {
      throw new Error('Missing userId or deviceId in login response');
    }
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('rpm-container').style.display = 'block';
    fetchRPM();
  } catch (error) {
    console.error('Login error:', error);
    alert('अमान्य उपयोगकर्ता नाम या पासवर्ड');
  }
});

async function fetchRPM() {
  if (!userId || !deviceId) {
    console.error('No user ID or device ID, please log in');
    document.getElementById('current-rpm').textContent = 'कृपया लॉगिन करें';
    return;
  }
  try {
    const url = `https://chetak-backend.vercel.app/rpm?userId=${userId}&deviceId=${deviceId}`;
    console.log('Fetching data from:', url);
    const response = await fetch(url);
    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
    }
    const data = await response.json();
    console.log('Received data:', data);
    
    // Filter data to last 1 minute (60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentData = data.filter(d => new Date(d.timestamp) >= oneMinuteAgo);
    
    if (recentData.length === 0) {
      console.warn('No RPM data available for the last minute');
      document.getElementById('current-rpm').textContent = 'कोई डेटा उपलब्ध नहीं';
      rpmChart.data.labels = [];
      rpmChart.data.datasets[0].data = [];
      rpmChart.update();
      return;
    }
    
    // Display latest RPM
    const latestRPM = recentData[recentData.length - 1].rpm;
    document.getElementById('current-rpm').textContent = `${latestRPM} RPM`;
    
    // Generate labels as seconds ago (e.g., 0s, 5s, 10s)
    const now = Date.now();
    rpmChart.data.labels = recentData.map(d => Math.floor((now - new Date(d.timestamp)) / 1000) + 's');
    rpmChart.data.datasets[0].data = recentData.map(d => parseFloat(d.rpm));
    rpmChart.update();
  } catch (error) {
    console.error('Error fetching RPM data:', error);
    document.getElementById('current-rpm').textContent = 'त्रुटि';
  }
}

setInterval(() => {
  if (userId && deviceId) {
    fetchRPM();
  }
}, 2000);
</DOCUMENT>

<DOCUMENT filename="styles.css">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

body {
  background-color: #f4f4f9;
  color: #333;
  line-height: 1.6;
}

header {
  background-color: #d70000;
  color: white;
  text-align: center;
  padding: 1rem;
}

header .logo {
  display: block;
  margin: 0 auto 10px;
  max-width: 150px;
  height: auto;
}

header h1 {
  font-size: 2rem;
}

main {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

#login-container {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

#login-container input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#login-container button {
  width: 100%;
  padding: 10px;
  background-color: #d70000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

#login-container button:hover {
  background-color: #b30000;
}

.rpm-display {
  text-align: center;
  margin-bottom: 20px;
}

.rpm-display h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.rpm-display p {
  font-size: 2rem;
  font-weight: bold;
  color: #d70000;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chart-container {
  padding: 20px;
}

.chart-container h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-align: center;
}

@media (max-width: 600px) {
  header h1 {
    font-size: 1.5rem;
  }

  header .logo {
    max-width: 100px;
  }

  .rpm-display p {
    font-size: 1.5rem;
  }

  main {
    padding: 0 10px;
  }
}
</DOCUMENT>
