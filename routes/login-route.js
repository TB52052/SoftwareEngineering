const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/', (req, res) => {
    if (!(req.session && req.session.user)) {
        return res.render('login.ejs');
    }
});

router.post('/', async (req, res) => {
    try {
        const account = await database.getAccount(req.body.email);

        if (!account || account.password === undefined) {
            req.session.message = 'Account not found.';
            return res.redirect('/login');
        }

        if (!(await database.comparePassword(req.body.password, account.password))) {
            req.session.message = 'Invalid credentials.';
            return res.redirect('/login');
        }

        req.session.user = {id: account.id, email: account.email};

        return res.redirect('/dashboard');
    } catch (error) {
        req.session.message = 'Internal Server Error';
        return res.status(500).send(error.message);
    }
});

module.exports = router;