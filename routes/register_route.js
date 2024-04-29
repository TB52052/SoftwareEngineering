const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

module.exports = router;

// Database
const db = new sqlite3.Database('./db/users.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});
const NUMBER_OF_HASHES = 13;

async function get_account(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function insert_new_account(email, password) {
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], (err) => {if (err) {console.error(err.message)};});
}

router.get('/', (req, res) => {
    res.render('register.ejs');
});

router.post('/', async (req, res) => {
    // Check if passwords match
    if (req.body.password !== req.body.confirm) {
        console.log('Passwords do not match');
        return res.redirect('/register');
    }
    // Check if user exists
    const account = await get_account(req.body.email);

    if (account) {
        console.log('User already exists')
        return res.redirect('/register');
    }

    // Hash password
    try {
        console.log('Creating new account');
        const hashedPassword = await bcrypt.hash(req.body.password, NUMBER_OF_HASHES);
        insert_new_account(req.body.email, hashedPassword);
        return res.redirect('/login');

    }
    catch {
        console.error('Error:', error);
        return res.redirect('/register');
    }
});
