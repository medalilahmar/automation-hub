// src/controllers/userController.js
const db = require('../services/databaseService');
const logger = require('../services/logger');

// Recherche d'utilisateurs (injection SQL)
exports.search = (req, res) => {
    try {
        const term = req.query.q || '';
        
        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`SELECT * FROM users WHERE username LIKE '%${term}%' OR email LIKE '%${term}%'`);
        const rows = stmt.all();
        
        res.json(rows);
    } catch (err) {
        logger.error(`Erreur recherche: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};

// Mise à jour d'un utilisateur (IDOR)
exports.updateUser = (req, res) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        // Construction dynamique de la requête (vulnérable)
        let setClause = [];
        let values = [];
        
        for (let [key, value] of Object.entries(updates)) {
            setClause.push(`${key} = ?`);
            values.push(value);
        }
        
        if (setClause.length === 0) {
            return res.status(400).json({ message: 'Aucune mise à jour' });
        }
        
        // VULNÉRABILITÉ 1 : IDOR - pas de vérification des droits
        // VULNÉRABILITÉ 2 : Injection SQL possible si les clés ne sont pas validées
        const query = `UPDATE users SET ${setClause.join(', ')} WHERE id = ${userId}`;
        const stmt = db.prepare(query);
        const info = stmt.run(...values);
        
        if (info.changes === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json({ message: 'Utilisateur mis à jour' });
    } catch (err) {
        logger.error(`Erreur mise à jour: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};

// Suppression d'un utilisateur (IDOR)
exports.deleteUser = (req, res) => {
    try {
        const userId = req.params.id;
        
        // VULNÉRABILITÉ : IDOR et injection SQL
        const stmt = db.prepare(`DELETE FROM users WHERE id = ${userId}`);
        const info = stmt.run();
        
        if (info.changes === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        logger.error(`Erreur suppression: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};