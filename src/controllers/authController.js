const jwt = require('jsonwebtoken');
const User = require('../database/models/User');
const logger = require('../services/logger');

const JWT_SECRET = 'supersecret';

exports.register = (req, res) => {
  const { username, password, email } = req.body;

  User.create({ username, password, email, role: 'user' }, function(err) {
    if (err) {
      logger.error(`Erreur inscription: ${err.message}`);
      return res.status(500).json({ message: 'Erreur interne' });
    }
    res.status(201).json({ message: 'Utilisateur créé' });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findByUsername(username, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  });
};

exports.getProfile = (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  });
};