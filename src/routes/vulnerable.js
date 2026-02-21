const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });


router.get('/xss', (req, res) => {
  const input = req.query.input || '';
  res.send(`<html><body>${input}</body></html>`);
});

router.get('/users', (req, res) => {
  const id = req.query.id;
  const users = [
    { id: 1, name: 'Admin', email: 'admin@example.com' },
    { id: 2, name: 'User', email: 'user@example.com' }
  ];
  const query = `SELECT * FROM users WHERE id = ${id}`;
  const results = users.filter(u => u.id == id);
  res.json({ query, results });
});


router.get('/ping', (req, res) => {
  const ip = req.query.ip || '127.0.0.1';
  exec(`ping -c 4 ${ip}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Erreur: ${error.message}`);
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});


router.get('/file', (req, res) => {
  const filename = req.query.file || 'test.txt';
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).send('Fichier non trouvé');
    }
    res.send(data);
  });
});


router.post('/upload', upload.single('file'), (req, res) => {

  res.json({
    message: 'Fichier uploadé avec succès',
    file: req.file
  });
});


const JWT_SECRET = 'secret';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = { id: 1, username: username || 'guest' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }
  try {
    const decoded = jwt.decode(token);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
});


router.get('/debug', (req, res) => {
  res.json({
    env: process.env,
    cwd: process.cwd(),
    db_path: process.env.DB_PATH || 'data.sqlite',
    jwt_secret: JWT_SECRET
  });
});


router.post('/calculate', (req, res) => {
  const n = parseInt(req.body.n) || 30;
  const fibonacci = (x) => {
    if (x <= 1) return x;
    return fibonacci(x - 1) + fibonacci(x - 2);
  };
  const result = fibonacci(n);
  res.json({ result });
});


const profiles = {
  1: { id: 1, name: 'Admin', email: 'admin@example.com', private: true },
  2: { id: 2, name: 'User', email: 'user@example.com', private: false },
  3: { id: 3, name: 'Another', email: 'another@example.com', private: true }
};

router.get('/profile/:id', (req, res) => {
  const id = req.params.id;
  const profile = profiles[id];
  if (!profile) {
    return res.status(404).json({ message: 'Profil non trouvé' });
  }
  res.json(profile);
});

router.get('/noheaders', (req, res) => {
  res.send('Cette page ne comporte aucun header de sécurité.');
});


router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur interne est survenue' });
});

module.exports = router;