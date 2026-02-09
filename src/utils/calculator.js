class Calculator {
  static validateNumbers(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Les deux paramètres doivent être des nombres');
    }
    
    if (!isFinite(a) || !isFinite(b)) {
      throw new Error('Les nombres doivent être finis');
    }
  }

  static add(a, b) {
    Calculator.validateNumbers(a, b);  
    return a + b;
  }

  static subtract(a, b) {
    Calculator.validateNumbers(a, b);  
    return a - b;
  }

  static multiply(a, b) {
    Calculator.validateNumbers(a, b);  
    return a * b;
  }

  static divide(a, b) {
    Calculator.validateNumbers(a, b);  
    if (b === 0) {
      throw new Error('Division par zéro');
    }
    return a / b;
  }

  static calculate(operation, a, b) {
    const operations = {
      add: Calculator.add,
      subtract: Calculator.subtract,
      multiply: Calculator.multiply,
      divide: Calculator.divide
    };

    if (!operations[operation]) {
      throw new Error(`Opération non supportée: ${operation}`);
    }

    return operations[operation](a, b);
  }
}

module.exports = Calculator;