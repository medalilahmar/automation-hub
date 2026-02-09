const express = require('express');
const CalculatorController = require('../controllers/calculatorController');

const router = express.Router();

router.get('/operations', CalculatorController.getOperations);
router.post('/calculate', CalculatorController.calculate);

module.exports = router;