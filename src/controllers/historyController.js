const db = require('../services/databaseService');

exports.addHistory = (req, res) => {
    try {
        const { user_id, action } = req.body;
        
        const stmt = db.prepare(`INSERT INTO history (user_id, action) VALUES (${user_id}, '${action}')`);
        const info = stmt.run();
        
        res.status(201).json({ id: info.lastInsertRowid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

exports.getUserHistory = (req, res) => {
    try {
        const userId = req.params.userId;
        
        const stmt = db.prepare(`SELECT * FROM history WHERE user_id = ${userId} ORDER BY timestamp DESC`);
        const rows = stmt.all();
        
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};