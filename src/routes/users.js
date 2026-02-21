const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/search', userController.search);

router.put('/:id', authMiddleware, userController.updateUser);

router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;