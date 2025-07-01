const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Маршрут для перевода
app.post('/api/update-translations', (req, res) => {
  try {
    const { language, section, translations } = req.body;
    
    // Валидация
    if (!language || !section || !translations) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    // Путь к файлу перевода
    const localesPath = path.join(__dirname, '../frontend/src/locales');
    const filePath = path.join(localesPath, section, `${language}.json`);

    // Создаём папки если их нет
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    
    // Записываем с красивым форматированием
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    
    console.log(`Переводы сохранены: ${filePath}`);
    res.json({ success: true });
    
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});