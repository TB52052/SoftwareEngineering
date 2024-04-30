const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./db/study_planner.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});
const NUMBER_OF_HASHES = 13;

async function get_account(email) {
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

function insert_new_account(email, password) {
    db.run(`INSERT INTO Users (email, password) VALUES (?, ?)`, [email, password], (err) => {if (err) {console.error(err.message)};});
}

router.get('/', (req, res) => {
    res.render('register.ejs');
});

router.post('/', async (req, res) => {
    // Check if passwords match
    if (req.body.password !== req.body.confirm) {
        req.session.message = 'Passwords do not match.';
        return res.redirect('/register');
    }
    // Check if user exists
    const account = await get_account(req.body.email);

    if (account) {
        req.session.message = 'User already exists.';
        return res.redirect('/register');
    }

    // Hash password
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, NUMBER_OF_HASHES);
        insert_new_account(req.body.email, hashedPassword);
        return res.redirect('/login');

    }
    catch {
        req.session.message = 'Internal Server Error';
        return res.redirect('/register');
    }
});

module.exports = router;
