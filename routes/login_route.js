const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
module.exports = router;

const db = new sqlite3.Database('./db/users.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});

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

router.get('/', (req, res) => {
    res.render('login.ejs');
});

router.post('/', async (req, res) => {
    try {
        // Check if user exists
        const account = await get_account(req.body.email);
        console.log(account);

        if (!account || account.password === undefined) {
            console.log('User not found');
            return res.redirect('/login');
        }

        if (!(await bcrypt.compare(req.body.password, account.password))) {
            console.log('Incorrect password');
            return res.redirect('/login');
        }

        console.log('Login successful');
        return res.redirect('/profile');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
});