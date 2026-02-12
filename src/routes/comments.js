const express = require('express');
const db = require('../database/db');
const router = express.Router();
const escapeHtml = require('escape-html');

// ==============================================
// 🔴 PARTIE 1 : ROUTES VULNÉRABLES XSS
// ==============================================

// 🔴 XSS RÉFLÉCHI - Sans échappement
router.get('/echo', (req, res) => {
    const msg = req.query.msg || 'Hello';
    
    res.send(`
        <html>
        <body>
            <h1>Message: ${msg}</h1>
            <p>VULNÉRABLE AU XSS !</p>
        </body>
        </html>
    `);
});

// 🔴 XSS STOCKÉ - Ajout sans nettoyage (VERSION CORRIGÉE)
router.post('/comment', express.json(), (req, res) => {
    try {
        const { author, content } = req.body;
        
        // ✅ NULL pour calculation_id (SANS commentaire dans la requête !)
        const stmt = db.prepare(`
            INSERT INTO comments (calculation_id, author, content)
            VALUES (NULL, ?, ?)
        `);
        
        const info = stmt.run(author || 'Anonymous', content || '');
        
        res.json({ 
            id: info.lastInsertRowid, 
            message: 'Commentaire ajouté (vulnérable)',
            content: content
        });
    } catch (error) {
        console.error('❌ ERREUR DB:', error.message);
        res.status(500).json({ 
            error: 'Erreur lors de l\'ajout du commentaire',
            details: error.message
        });
    }
});

// 🔴 XSS STOCKÉ - Affichage sans échappement
router.get('/comments', (req, res) => {
    try {
        const comments = db.prepare('SELECT * FROM comments ORDER BY created_at DESC').all();
        
        let html = '<html><body><h1>📝 Commentaires</h1>';
        html += `<p>Total: ${comments.length} commentaire(s)</p>`;
        
        comments.forEach(c => {
            html += `<div style="border:1px solid #ccc; margin:10px; padding:10px;">
                <strong>👤 ${c.author || 'Anonymous'}</strong>: ${c.content}
                <br><small>📅 ${c.created_at}</small>
            </div>`;
        });
        
        html += '</body></html>';
        res.send(html);
    } catch (error) {
        res.status(500).send('Erreur: ' + error.message);
    }
});

// ==============================================
// ✅ PARTIE 2 : ROUTES SÉCURISÉES
// ==============================================

// ✅ XSS RÉFLÉCHI - Avec échappement
router.get('/echo-safe', (req, res) => {
    const msg = req.query.msg || 'Hello';
    const safeMsg = escapeHtml(msg);
    
    res.send(`
        <html>
        <body>
            <h1>Message: ${safeMsg}</h1>
            <p>✅ PROTÉGÉ CONTRE LE XSS !</p>
        </body>
        </html>
    `);
});

// ✅ XSS STOCKÉ - Avec nettoyage (VERSION CORRIGÉE)
router.post('/comment-safe', express.json(), (req, res) => {
    try {
        const { author, content } = req.body;
        
        // ✅ Nettoyage XSS
        const cleanAuthor = escapeHtml(author || 'Anonymous');
        const cleanContent = escapeHtml(content || '');
        
        // ✅ MÊME STRUCTURE QUE LA VERSION VULNÉRABLE !
        const stmt = db.prepare(`
            INSERT INTO comments (calculation_id, author, content)
            VALUES (NULL, ?, ?)
        `);
        
        const info = stmt.run(cleanAuthor, cleanContent);
        
        res.json({ 
            id: info.lastInsertRowid, 
            message: 'Commentaire sécurisé ajouté',
            safe: true
        });
    } catch (error) {
        console.error('❌ ERREUR DB:', error.message);
        res.status(500).json({ 
            error: 'Erreur lors de l\'ajout du commentaire sécurisé',
            details: error.message
        });
    }
});

// ==============================================
// 🆕 ROUTE DE DIAGNOSTIC (OPTIONNELLE)
// ==============================================
router.get('/debug', (req, res) => {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(comments)").all();
        const count = db.prepare("SELECT COUNT(*) as total FROM comments").get();
        
        res.json({
            table_exists: true,
            columns: tableInfo,
            total_comments: count.total,
            status: 'OK'
        });
    } catch (error) {
        res.json({
            table_exists: false,
            error: error.message
        });
    }
});

module.exports = router;