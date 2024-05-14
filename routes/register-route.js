const express = require('express');
const router = express.Router();
const database = require('../database/database');

router.get('/', (req, res) => {
    res.render('register.ejs');
});

router.post('/', async (req, res) => {
    // Check if passwords match
    if (req.body.password !== req.body.confirm) {
        req.session.message = 'Passwords do not match.';
        req.session.isError = true;
        return res.redirect('/register');
    }
    // Check if user exists
    const account = await database.getAccount(req.body.email);

    if (account) {
        req.session.message = 'User already exists.';
        req.session.isError = true;
        return res.redirect('/register');
    }

    // Hash password
    try {
        const hashedPassword = await database.hashPassword(req.body.password);
        database.insertNewAccount(req.body.email, hashedPassword, req.body.forename, req.body.surname);
        return res.redirect('/login');

    }
    catch {
        req.session.message = 'Internal Server Error';
        req.session.isError = true;
        return res.redirect('/register');
    }
});

module.exports = router;
