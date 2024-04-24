const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

module.exports = router;

// Database
const db = new sqlite3.Database('./db/users.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});
const SALT = 13;

async function get_account(email) {
    return await db.get(`SELECT * FROM users WHERE email = ?`, [email], (row) => {return row;});
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
        return res.redirect('/register');
    }

    // Check if user exists
    if (get_account(req.body.email)) {
        return res.redirect('/register');
    }

    // Hash password
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, SALT);
        insert_new_account(req.body.email, hashedPassword);
        return res.redirect('/login');
    }
    catch {
        return res.redirect('/register');
    }
});
