const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./db/study_planner.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});
const NUMBER_OF_HASHES = 13;

function getAccount(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function insertNewAccount(email, password) {
    db.run(`INSERT INTO Users (email, password) VALUES (?, ?)`, [email, password], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, NUMBER_OF_HASHES, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

function comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = { getAccount, insertNewAccount, hashPassword, comparePassword};
