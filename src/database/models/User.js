// src/database/models/User.js
const db = require('../../services/databaseService');

const User = {
    // VULNÉRABILITÉ : Injection SQL
    findById: (id) => {
        const stmt = db.prepare(`SELECT * FROM users WHERE id = ${id}`);
        return stmt.get();
    },

    findByUsername: (username) => {
        const stmt = db.prepare(`SELECT * FROM users WHERE username = '${username}'`);
        return stmt.get();
    },

    create: (user) => {
        const { username, password, email, role } = user;
        const stmt = db.prepare(`INSERT INTO users (username, password, email, role) VALUES ('${username}', '${password}', '${email}', '${role}')`);
        return stmt.run();
    },

    update: (id, data) => {
        let setClause = [];
        let values = [];
        
        for (let [key, value] of Object.entries(data)) {
            setClause.push(`${key} = ?`);
            values.push(value);
        }
        
        if (setClause.length === 0) return null;
        
        const query = `UPDATE users SET ${setClause.join(', ')} WHERE id = ${id}`;
        const stmt = db.prepare(query);
        return stmt.run(...values);
    },

    delete: (id) => {
        const stmt = db.prepare(`DELETE FROM users WHERE id = ${id}`);
        return stmt.run();
    }
};

module.exports = User;