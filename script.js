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
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 1rem;
}

header h1 {
  font-size: 2rem;
}

main {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
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
  color: #007bff;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chart-container {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

  .rpm-display p {
    font-size: 1.5rem;
  }

  main {
    padding: 0 10px;
  }
}
