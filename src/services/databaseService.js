// src/services/databaseService.js
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Chemin de la base de données
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data.sqlite');

// Créer le dossier si nécessaire
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialiser la base de données (sans verbose())
const db = new Database(dbPath);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    path TEXT,
    user_id INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Insérer un utilisateur admin par défaut si la table est vide
const adminExists = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!adminExists) {
    const insert = db.prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    insert.run('admin', 'admin', 'admin@example.com', 'admin');
    
    // Ajouter quelques utilisateurs de test
    insert.run('user1', 'password1', 'user1@example.com', 'user');
    insert.run('user2', 'password2', 'user2@example.com', 'user');
    
    console.log('✅ Utilisateurs de test créés');
}

console.log('✅ Base de données initialisée avec données de test');

module.exports = db;