const express = require('express');
const db = require('../database/db');
const router = express.Router();

// ==============================================
// 🟢 ROUTE DE TEST - Vérifier que le router fonctionne
// ==============================================
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: '✅ Route history opérationnelle',
        timestamp: new Date().toISOString(),
        endpoints: {
            search_vuln: '/history/search?q=',
            search_safe: '/history/search-safe?q=',
            all: '/history',
            limit_vuln: '/history/limit?limit=',
            orderby_vuln: '/history?sort=',
            orderby_safe: '/history/safe?sort='
        }
    });
});

// ==============================================
// 🔴 PARTIE 1 : ROUTES VOLONTAIREMENT VULNÉRABLES
// ==============================================

/**
 * 🔴 VULNÉRABILITÉ #1 : SQL Injection dans LIKE
 * URL: GET /history/search?q=add
 * 
 * 🎯 TEST D'ATTAQUE:
 * http://localhost:3000/history/search?q=a%' UNION SELECT name, sql, 1, 2, 3, 4, 5 FROM sqlite_master; --
 */
router.get('/search', (req, res) => {
    const search = req.query.q || '';
    
    try {
        // 🔴 DANGER ! Concaténation directe = Injection SQL
        const query = `SELECT * FROM calculations WHERE operation LIKE '%${search}%' ORDER BY created_at DESC`;
        
        console.log('🔴 [VULNÉRABLE] Requête SQL:', query);
        
        const results = db.prepare(query).all();
        
        res.json({
            vuln: true,
            query: query,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Erreur SQL',
            message: error.message,
            query: `SELECT * FROM calculations WHERE operation LIKE '%${search}%'`
        });
    }
});

/**
 * 🔴 VULNÉRABILITÉ #2 : SQL Injection dans ORDER BY
 * URL: GET /history?sort=created_at
 * 
 * 🎯 TEST D'ATTAQUE:
 * http://localhost:3000/history?sort=created_at DESC; DROP TABLE calculations; --
 */
router.get('/', (req, res) => {
    const sort = req.query.sort || 'created_at';
    
    try {
        // 🔴 DANGER ! Injection possible dans ORDER BY
        const query = `SELECT * FROM calculations ORDER BY ${sort} DESC`;
        
        console.log('🔴 [VULNÉRABLE] ORDER BY:', query);
        
        const results = db.prepare(query).all();
        res.json({
            vuln: true,
            query: query,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            query: `SELECT * FROM calculations ORDER BY ${sort} DESC`
        });
    }
});

/**
 * 🔴 VULNÉRABILITÉ #3 : SQL Injection dans LIMIT
 * URL: GET /history/limit?limit=10
 * 
 * 🎯 TEST D'ATTAQUE:
 * http://localhost:3000/history/limit?limit=10; DROP TABLE comments; --
 */
router.get('/limit', (req, res) => {
    const limit = req.query.limit || 10;
    
    try {
        // 🔴 DANGER ! Injection dans LIMIT
        const query = `SELECT * FROM calculations LIMIT ${limit}`;
        
        console.log('🔴 [VULNÉRABLE] LIMIT:', query);
        
        const results = db.prepare(query).all();
        res.json({
            vuln: true,
            query: query,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message,
            query: `SELECT * FROM calculations LIMIT ${limit}`
        });
    }
});

// ==============================================
// ✅ PARTIE 2 : ROUTES CORRIGÉES (BONNES PRATIQUES)
// ==============================================

/**
 * ✅ CORRIGÉ : Requêtes paramétrées
 * URL: GET /history/search-safe?q=add
 * 
 * 🎯 PROTECTION: Utilisation de ? au lieu de concaténation
 */
router.get('/search-safe', (req, res) => {
    const search = req.query.q || '';
    
    try {
        // ✅ SÉCURISÉ - Paramètre avec ?
        const query = `SELECT * FROM calculations WHERE operation LIKE ? ORDER BY created_at DESC`;
        const results = db.prepare(query).all(`%${search}%`);
        
        res.json({
            vuln: false,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message
        });
    }
});

/**
 * ✅ CORRIGÉ : ORDER BY avec whitelist
 * URL: GET /history/safe?sort=created_at
 * 
 * 🎯 PROTECTION: Whitelist des colonnes autorisées
 */
router.get('/safe', (req, res) => {
    // ✅ Whitelist des colonnes autorisées
    const allowedSort = ['id', 'operation', 'a', 'b', 'result', 'created_at'];
    let sort = req.query.sort || 'created_at';
    
    if (!allowedSort.includes(sort)) {
        sort = 'created_at';
    }
    
    try {
        const query = `SELECT * FROM calculations ORDER BY ${sort} DESC`;
        const results = db.prepare(query).all();
        
        res.json({
            vuln: false,
            sort: sort,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message
        });
    }
});

/**
 * ✅ CORRIGÉ : LIMIT avec validation
 * URL: GET /history/limit-safe?limit=5
 * 
 * 🎯 PROTECTION: Conversion en nombre entier
 */
router.get('/limit-safe', (req, res) => {
    // ✅ Validation - s'assurer que limit est un nombre
    let limit = parseInt(req.query.limit) || 10;
    
    // ✅ Limiter à 100 maximum
    if (limit > 100) limit = 100;
    if (limit < 1) limit = 1;
    
    try {
        const query = `SELECT * FROM calculations LIMIT ?`;
        const results = db.prepare(query).all(limit);
        
        res.json({
            vuln: false,
            limit: limit,
            count: results.length,
            results: results
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message
        });
    }
});

// ==============================================
// 📝 ROUTES DE MANIPULATION DES DONNÉES
// ==============================================

/**
 * ✅ Ajouter un calcul à l'historique
 * POST /history
 * Body: { operation, a, b, result }
 */
router.post('/', express.json(), (req, res) => {
    const { operation, a, b, result } = req.body;
    
    // Validation basique
    if (!operation || a === undefined || b === undefined || result === undefined) {
        return res.status(400).json({ 
            error: 'Champs requis: operation, a, b, result' 
        });
    }
    
    try {
        const stmt = db.prepare(`
            INSERT INTO calculations (operation, a, b, result)
            VALUES (?, ?, ?, ?)
        `);
        
        const info = stmt.run(operation, a, b, result);
        
        res.status(201).json({ 
            success: true,
            id: info.lastInsertRowid,
            operation, 
            a, 
            b, 
            result,
            message: 'Calcul ajouté avec succès'
        });
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * ✅ Récupérer un calcul par ID
 * GET /history/:id
 */
router.get('/:id', (req, res) => {
    const id = req.params.id;
    
    try {
        // ✅ Requête paramétrée
        const result = db.prepare('SELECT * FROM calculations WHERE id = ?').get(id);
        
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ 
                error: 'Calcul non trouvé',
                id: id
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

/**
 * ✅ Supprimer un calcul (soft delete ou réel selon besoin)
 * DELETE /history/:id
 */
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    
    try {
        const stmt = db.prepare('DELETE FROM calculations WHERE id = ?');
        const result = stmt.run(id);
        
        if (result.changes > 0) {
            res.json({ 
                success: true, 
                message: 'Calcul supprimé',
                id: parseInt(id)
            });
        } else {
            res.status(404).json({ 
                error: 'Calcul non trouvé',
                id: id
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

// ==============================================
// 📊 STATISTIQUES
// ==============================================

/**
 * ✅ Statistiques des calculs
 * GET /history/stats/summary
 */
router.get('/stats/summary', (req, res) => {
    try {
        const stats = {
            total: db.prepare('SELECT COUNT(*) as count FROM calculations').get(),
            by_operation: db.prepare(`
                SELECT operation, COUNT(*) as count, AVG(result) as avg_result
                FROM calculations 
                GROUP BY operation
            `).all(),
            last_calc: db.prepare(`
                SELECT * FROM calculations 
                ORDER BY created_at DESC 
                LIMIT 1
            `).get()
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});

module.exports = router;