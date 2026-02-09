const Calculator = require('../src/utils/calculator');

describe('Calculator Unit Tests', () => {
  describe('Addition', () => {
    test('devrait additionner deux nombres positifs', () => {
      expect(Calculator.add(2, 3)).toBe(5);
    });

    test('devrait additionner des nombres négatifs', () => {
      expect(Calculator.add(-1, -2)).toBe(-3);
    });

    test('devrait lancer une erreur avec des non-nombres', () => {
      expect(() => Calculator.add('a', 2)).toThrow('Les deux paramètres doivent être des nombres');
    });
  });

  describe('Soustraction', () => {
    test('devrait soustraire correctement', () => {
      expect(Calculator.subtract(10, 4)).toBe(6);
    });
  });

  describe('Multiplication', () => {
    test('devrait multiplier correctement', () => {
      expect(Calculator.multiply(3, 4)).toBe(12);
    });

    test('devrait gérer la multiplication par zéro', () => {
      expect(Calculator.multiply(5, 0)).toBe(0);
    });
  });

  describe('Division', () => {
    test('devrait diviser correctement', () => {
      expect(Calculator.divide(10, 2)).toBe(5);
    });

    test('devrait lancer une erreur pour division par zéro', () => {
      expect(() => Calculator.divide(5, 0)).toThrow('Division par zéro');
    });
  });

  describe('Calculate method', () => {
    test('devrait appeler la bonne opération', () => {
      expect(Calculator.calculate('add', 2, 3)).toBe(5);
      expect(Calculator.calculate('subtract', 5, 2)).toBe(3);
      expect(Calculator.calculate('multiply', 3, 4)).toBe(12);
      expect(Calculator.calculate('divide', 10, 2)).toBe(5);
    });

    test('devrait lancer une erreur pour opération invalide', () => {
      expect(() => Calculator.calculate('invalid', 1, 2))
        .toThrow('Opération non supportée: invalid');
    });
  });
});