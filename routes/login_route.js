const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

module.exports = router;

const db = new sqlite3.Database('./db/users.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});

function get_account(email) {
    return db.get(`SELECT * FROM users WHERE email = ?`, [email], (row) => {return row;});
}

router.get('/', (req, res) => {
    res.render('login.ejs');
});

router.post('/', async (req, res) => {
    // Check if user exists
    let account = get_account(req.body.email);

    if (account.password === undefined) {
        console.log('User not found');
        return res.redirect('/login');
    }

    if (!(await bcrypt.compare(req.body.password, account.password))) {
        console.log('Incorrect password');
        return res.redirect('/login');
    }

    console.log('Login successful');
    return res.redirect('/dashboard');
});

