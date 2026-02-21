const express = require('express');
const db = require('../database/db');
const router = express.Router();
const escapeHtml = require('escape-html');
const commentController = require('../controllers/commentController');

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

router.post('/comment', express.json(), (req, res) => {
    try {
        const { author, content } = req.body;
        
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

router.post('/comment-safe', express.json(), (req, res) => {
    try {
        const { author, content } = req.body;
        
        const cleanAuthor = escapeHtml(author || 'Anonymous');
        const cleanContent = escapeHtml(content || '');
        
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


router.post('/', commentController.addComment);

router.get('/user/:userId', commentController.getUserComments);

router.get('/:id', commentController.getComment);

router.get('/:id/render', commentController.renderComment);

module.exports = router;