const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

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
    if (!(req.session && req.session.user)) {
        return res.render('login.ejs');
    }
});

router.post('/', async (req, res) => {
    try {
        const account = await get_account(req.body.email);

        if (!account || account.password === undefined) {
            req.session.message = 'Account not found.';
            return res.redirect('/login');
        }

        if (!(await bcrypt.compare(req.body.password, account.password))) {
            req.session.message = 'Invalid credentials.';
            return res.redirect('/login');
        }

        req.session.user = {id: account.id, email: account.email};

        return res.redirect('/dashboard');
    } catch (error) {
        req.session.message = 'Internal Server Error';
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;