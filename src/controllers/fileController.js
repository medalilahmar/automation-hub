// src/controllers/fileController.js
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const db = require('../services/databaseService');

// Configuration multer
const upload = multer({ dest: 'uploads/' });

// Upload de fichier
exports.uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier' });
    }

    try {
        const originalName = req.file.originalname;
        const tempPath = req.file.path;
        const targetPath = path.join(__dirname, '../../uploads/', originalName);

        // VULNÉRABILITÉ : Path traversal possible via originalName
        fs.renameSync(tempPath, targetPath);

        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`INSERT INTO files (filename, path, user_id) VALUES ('${originalName}', '${targetPath}', ${req.body.user_id || 1})`);
        stmt.run();

        res.json({ message: 'Fichier uploadé', filename: originalName });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur sauvegarde' });
    }
};

// Téléchargement de fichier
exports.downloadFile = (req, res) => {
    const filename = req.query.file;
    
    // VULNÉRABILITÉ : Path traversal
    const filePath = path.join(__dirname, '../../uploads/', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send('Fichier non trouvé');
    }
};

// Exécution de commande sur un fichier
exports.convertFile = (req, res) => {
    const filename = req.query.file;
    const format = req.query.format || 'txt';

    // VULNÉRABILITÉ : Command injection
    const command = `convert ${filename} ${filename}.${format}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Erreur: ${error.message}`);
        }
        res.send(`Conversion terminée : ${stdout}`);
    });
};

// Liste des fichiers d'un utilisateur
exports.listFiles = (req, res) => {
    try {
        const userId = req.query.userId;
        
        // VULNÉRABILITÉ : Injection SQL
        const stmt = db.prepare(`SELECT * FROM files WHERE user_id = ${userId}`);
        const rows = stmt.all();
        
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};