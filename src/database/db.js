const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../data.sqlite');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL,
    a REAL NOT NULL,
    b REAL NOT NULL,
    result REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    calculation_id INTEGER,
    author TEXT DEFAULT 'Anonymous',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (calculation_id) REFERENCES calculations (id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO calculations (operation, a, b, result)
    VALUES (?, ?, ?, ?)
  `);
  
  insert.run('add', 10, 5, 15);
  insert.run('subtract', 20, 8, 12);
  insert.run('multiply', 6, 7, 42);
  insert.run('divide', 100, 4, 25);
  
  console.log('✅ Base de données initialisée avec données de test');
} catch (error) {
  console.error('❌ Erreur initialisation DB:', error.message);
}

module.exports = db;