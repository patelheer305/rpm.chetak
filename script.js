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
      x: { grid: { display: true, drawBorder: true }, title: { display: true, text: 'Seconds Ago' } },
      y: { grid: { display: true, drawBorder: true }, title: { display: true, text: 'RPM' } }
    },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  }
});

let userId = null;
let deviceId = null;

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://chetak-backend.vercel.app/login', { // Replace with actual Glitch URL
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

