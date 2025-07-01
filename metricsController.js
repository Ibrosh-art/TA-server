// metricsController.js
const fs = require('fs');
const path = require('path');

const metricsFilePath = path.join(__dirname, 'metrics.json');

// Загрузка метрик из файла
function loadMetrics() {
  try {
    if (fs.existsSync(metricsFilePath)) {
      const data = fs.readFileSync(metricsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return getDefaultMetrics();
  } catch (error) {
    console.error('Error loading metrics:', error);
    return getDefaultMetrics();
  }
}

// Сохранение метрик в файл
function saveMetrics(metrics) {
  try {
    fs.writeFileSync(metricsFilePath, JSON.stringify(metrics, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving metrics:', error);
    return false;
  }
}

function getDefaultMetrics() {
  return {
    cagr: 23.4,
    volatility: 13.8,
    calmarRatio: 0.83,
    alpha: 2.1,
    beta: 0.72,
    skewness: 0.5,
    kurtosis: 3.2,
    positiveDays: 56,
    avgWinLoss: 1.7,
    exposureTime: 78,
    sharpe: 1.42,
    sortino: 2.01,
    maxDrawdown: -6.5,
    winrate: 69,
    profitFactor: 1.8,
    expectancy: 0.4,
    kelly: 15.2
  };
}

// Получение текущих метрик
exports.getMetrics = (req, res) => {
  try {
    const metrics = loadMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load metrics' });
  }
};

// Обновление метрик
exports.updateMetrics = (req, res) => {
  try {
    const success = saveMetrics(req.body);
    if (success) {
      res.status(200).json({ message: 'Metrics saved successfully' });
    } else {
      res.status(500).json({ error: 'Failed to save metrics' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save metrics' });
  }
};

app.listen(3000, () => console.log('Server running on port 3000'));
