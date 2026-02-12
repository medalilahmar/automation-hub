const Calculator = require('../utils/calculator');

class CalculatorController {
  static calculate(req, res) {
    const { operation, a, b } = req.body;

    if (typeof a === 'undefined' || typeof b === 'undefined') {
      return res.status(400).json({ error: 'Les paramètres a et b sont requis' });
    }

    if (typeof operation === 'undefined') {
      return res.status(400).json({ error: 'L\'opération est requise' });
    }

    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) {
      return res.status(400).json({ error: 'Les paramètres a et b doivent être des nombres valides' });
    }

    try {
       const result = Calculator.calculate(operation, numA, numB);
      res.json({
        operation,
        a: numA,
        b: numB,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static getOperations(req, res) {
    res.json({
      operations: [
        { name: 'addition', value: 'add' },
        { name: 'soustraction', value: 'subtract' },
        { name: 'multiplication', value: 'multiply' },
        { name: 'division', value: 'divide' }
      ]
    });
  }
}

module.exports = CalculatorController;