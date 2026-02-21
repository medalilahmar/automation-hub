const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 

router.post('/upload', upload.single('file'), fileController.uploadFile);

router.get('/download', fileController.downloadFile);

router.get('/convert', fileController.convertFile);

router.get('/', fileController.listFiles);

module.exports = router;