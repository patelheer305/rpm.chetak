const rpmChart = new Chart(document.getElementById('rpmChart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'रोटोर शाफ्ट RPM',
            data: [],
            borderColor: '#d70000',
            backgroundColor: 'rgba(215, 0, 0, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { grid: { display: true }, title: { display: true, text: 'सेकंड पहले' } },
            y: { grid: { display: true }, title: { display: true, text: 'RPM' } }
        },
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
    }
});

const gaugeOptions = {
    angle: 0.15,
    lineWidth: 0.44,
    radiusScale: 1.0,
    pointer: { length: 0.6, strokeWidth: 0.035, color: '#000000' },
    limitMax: true,
    limitMin: true,
    colorStart: '#6FADCF',
    colorStop: '#8FC0DA',
    strokeColor: '#E0E0E0',
    generateGradient: true,
    highDpiSupport: true,
    staticZones: [
        { strokeStyle: '#FF0000', min: 0, max: 200 },
        { strokeStyle: '#FFFF00', min: 200, max: 600 },
        { strokeStyle: '#00FF00', min: 600, max: 1000 }
    ],
    staticLabels: { font: '10px sans-serif', labels: [0, 200, 600, 1000], fractionDigits: 0 }
};

const gauges = {
    fan1: new Gauge(document.getElementById('fan1Gauge')).setOptions({ ...gaugeOptions, colorStart: '#0000ff', colorStop: '#0000ff' }),
    fan2: new Gauge(document.getElementById('fan2Gauge')).setOptions({ ...gaugeOptions, colorStart: '#00d700', colorStop: '#00d700' }),
    fan3: new Gauge(document.getElementById('fan3Gauge')).setOptions({ ...gaugeOptions, colorStart: '#d700d7', colorStop: '#d700d7' }),
    fan4: new Gauge(document.getElementById('fan4Gauge')).setOptions({ ...gaugeOptions, colorStart: '#d7d700', colorStop: '#d7d700' })
};

Object.values(gauges).forEach(gauge => {
    gauge.maxValue = 1000;
    gauge.setMinValue(0);
    gauge.set(0);
});

let userId = null;
let deviceId = null;
let isDualShaft = false;
let activeTab = 'rotor';

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.target;
        document.querySelectorAll('.rotor-section, .fan-section').forEach(section => section.classList.remove('active'));
        document.querySelector(`.${activeTab}-section`).classList.add('active');
        fetchData();
    });
});

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
        if (!response.ok) throw new Error(`Login failed: ${data.error || 'Unknown error'}`);
        userId = data.userId;
        deviceId = data.devices && data.devices[0];
        if (!userId || !deviceId) throw new Error('Missing userId or deviceId');
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('rpm-container').style.display = 'block';
        fetchData();
    } catch (error) {
        console.error('Login error:', error);
        alert('अमान्य उपयोगकर्ता नाम या पासवर्ड');
    }
});

async function fetchData() {
    if (!userId || !deviceId) {
        document.getElementById('rotor-rpm').textContent = 'कृपया लॉगिन करें';
        document.querySelectorAll('.fan-tab, .fan-section').forEach(el => el.style.display = 'none');
        rpmChart.data.labels = [];
        rpmChart.data.datasets[0].data = [];
        rpmChart.update();
        Object.values(gauges).forEach(gauge => gauge.set(0));
        return;
    }
    try {
        const url = `https://chetak-backend.vercel.app/rpm?userId=${userId}&deviceId=${deviceId}`; // Replace with confirmed Vercel URL
        console.log('Fetching data from:', url);
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
        const data = await response.json();
        console.log('Received data:', data);

        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentData = data.filter(d => new Date(d.timestamp) >= oneMinuteAgo);

        if (recentData.length === 0) {
            console.warn('No data available for the last minute');
            document.getElementById('rotor-rpm').textContent = 'कोई डेटा उपलब्ध नहीं';
            document.querySelectorAll('.fan-tab, .fan-section').forEach(el => el.style.display = 'none');
            rpmChart.data.labels = [];
            rpmChart.data.datasets[0].data = [];
            rpmChart.update();
            Object.values(gauges).forEach(gauge => gauge.set(0));
            return;
        }

        const latest = recentData[recentData.length - 1];
        isDualShaft = latest.rpm2_1 > 0 || latest.rpm2_2 > 0 || latest.rpm2_3 > 0 || latest.rpm2_4 > 0;
        document.querySelectorAll('.fan-tab').forEach(tab => tab.style.display = isDualShaft ? 'inline-block' : 'none');
        document.querySelector('.fan-section').style.display = isDualShaft && activeTab === 'fan' ? 'block' : 'none';
        document.querySelector('.rotor-section').style.display = activeTab === 'rotor' ? 'block' : 'none';

        document.getElementById('rotor-rpm').textContent = latest.rpm1 + ' RPM';
        document.getElementById('fan1-rpm').textContent = latest.rpm2_1;
        document.getElementById('fan2-rpm').textContent = latest.rpm2_2;
        document.getElementById('fan3-rpm').textContent = latest.rpm2_3;
        document.getElementById('fan4-rpm').textContent = latest.rpm2_4;

        if (activeTab === 'rotor') {
            const now = Date.now();
            rpmChart.data.labels = recentData.map(d => Math.floor((now - new Date(d.timestamp)) / 1000) + 's');
            rpmChart.data.datasets[0].data = recentData.map(d => parseFloat(d.rpm1));
            rpmChart.update();
        } else {
            gauges.fan1.set(latest.rpm2_1);
            gauges.fan2.set(latest.rpm2_2);
            gauges.fan3.set(latest.rpm2_3);
            gauges.fan4.set(latest.rpm2_4);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('rotor-rpm').textContent = 'त्रुटि';
        document.querySelectorAll('.fan-tab, .fan-section').forEach(el => el.style.display = 'none');
        rpmChart.data.labels = [];
        rpmChart.data.datasets[0].data = [];
        rpmChart.update();
        Object.values(gauges).forEach(gauge => gauge.set(0));
    }
}

setInterval(() => {
    if (userId && deviceId) {
        fetchData();
    }
}, 2000);
