const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

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
  res.json({
    query: `SELECT * FROM users WHERE id = ${id}`,
    results: users.filter(u => u.id == id)
  });
});

router.get('/ping', (req, res) => {
  const ip = req.query.ip || '127.0.0.1';
  exec(`ping -c 4 ${ip}`, (error, stdout) => {
    res.send(`<pre>${stdout}</pre>`);
  });
});

const fs = require('fs');
router.get('/file', (req, res) => {
  const filename = req.query.file || 'test.txt';
  fs.readFile(filename, 'utf8', (err, data) => {
    res.send(data);
  });
});

module.exports = router;