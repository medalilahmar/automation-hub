// src/controllers/commentController.js
const db = require('../services/databaseService');
const logger = require('../services/logger');

// Ajout d'un commentaire
exports.addComment = (req, res) => {
    try {
        const { user_id, content } = req.body;
        
        // VULNÉRABILITÉ : Injection SQL - utilisation directe des valeurs
        const stmt = db.prepare(`INSERT INTO comments (user_id, content) VALUES (${user_id}, '${content}')`);
        const info = stmt.run();
        
        res.status(201).json({ id: info.lastInsertRowid, content });
    } catch (err) {
        logger.error(`Erreur ajout commentaire: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};

// Récupération des commentaires d'un utilisateur
exports.getUserComments = (req, res) => {
    try {
        const userId = req.params.userId;
        
        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`SELECT * FROM comments WHERE user_id = ${userId}`);
        const rows = stmt.all();
        
        res.json(rows);
    } catch (err) {
        logger.error(`Erreur récupération commentaires: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};

// Récupération d'un commentaire spécifique
exports.getComment = (req, res) => {
    try {
        const id = req.params.id;
        
        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`SELECT * FROM comments WHERE id = ${id}`);
        const row = stmt.get();
        
        if (!row) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }
        res.json(row);
    } catch (err) {
        logger.error(`Erreur récupération commentaire: ${err.message}`);
        res.status(500).json({ message: 'Erreur interne' });
    }
};

// Affichage en HTML (XSS)
exports.renderComment = (req, res) => {
    try {
        const id = req.params.id;
        
        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`SELECT * FROM comments WHERE id = ${id}`);
        const row = stmt.get();
        
        if (!row) {
            return res.status(404).send('Commentaire non trouvé');
        }
        
        // VULNÉRABILITÉ : XSS - contenu non échappé
        res.send(`
            <html>
                <head><title>Commentaire</title></head>
                <body>
                    <h1>Commentaire</h1>
                    <div>${row.content}</div>
                    <a href="/">Retour</a>
                </body>
            </html>
        `);
    } catch (err) {
        logger.error(`Erreur rendu commentaire: ${err.message}`);
        res.status(500).send('Erreur interne');
    }
};