const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Добавлено ---

const SECRET = 'super_secret_key_change_me';

// Заготовка пользователей (пароль хеширован bcrypt)
const users = [
  {
    username: 'TRadmin',
    passwordHash: '$2b$12$MPOXCN.4E6eCW3oL3w9JQOC5x9uBMCqlnFCW8EDf6/jAmGx0US0r2' // пароль Tr@d1nG_Admin_2025!
  }
];

// Ограничение количества попыток входа
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Слишком много попыток входа, попробуйте позже' }
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Missing username or password' });

  const user = users.find(u => u.username === username);
  if (!user)
    return res.status(401).json({ message: 'Invalid credentials' });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid)
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware для проверки JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: 'Malformed token' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// --- Конец добавленного кода ---

// Маршрут для перевода, теперь защищённый
app.post('/api/update-translations', authenticateToken, (req, res) => {
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
