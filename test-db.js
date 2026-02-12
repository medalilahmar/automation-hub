const db = require('./src/database/db.js');

console.log('=================================');
console.log(' INSPECTION BASE DE DONNÉES');
console.log('=================================');

// 1. Vérifier la connexion
console.log('\n Connexion DB établie');

// 2. Lister les tables
console.log('\n TABLES:');
try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    if (tables.length === 0) {
        console.log('   Aucune table trouvée');
    } else {
        tables.forEach(t => console.log('   ' + t.name));
    }
} catch (e) {
    console.log('   Erreur lecture tables:', e.message);
}

// 3. Lire les calculs
console.log('\n CALCULS:');
try {
    const calc = db.prepare('SELECT * FROM calculations').all();
    if (calc.length === 0) {
        console.log('   Aucun calcul trouvé');
    } else {
        calc.forEach(c => {
            let sign = '';
            if (c.operation === 'add') sign = '+';
            else if (c.operation === 'subtract') sign = '-';
            else if (c.operation === 'multiply') sign = '*';
            else if (c.operation === 'divide') sign = '/';
            
            console.log('  ' + c.id + '. ' + c.a + ' ' + sign + ' ' + c.b + ' = ' + c.result + ' (' + c.operation + ')');
        });
        console.log('\n   Total: ' + calc.length + ' calculs');
    }
} catch (e) {
    console.log('   Erreur lecture calculs:', e.message);
}

console.log('\n=================================');
