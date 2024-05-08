const express = require('express');
const router = express.Router();
const database = require('../database');

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
    const account = await database.getAccount(req.body.email);

    if (account) {
        req.session.message = 'User already exists.';
        return res.redirect('/register');
    }

    // Hash password
    try {
        const hashedPassword = await database.hashPassword(req.body.password);
        database.insertNewAccount(req.body.email, hashedPassword);
        return res.redirect('/login');

    }
    catch {
        req.session.message = 'Internal Server Error';
        return res.redirect('/register');
    }
});

module.exports = router;
