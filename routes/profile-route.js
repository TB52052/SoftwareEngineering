const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/study_planner.db');
const database = require('../database.js');

async function getSemester() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Season FROM SemesterInfo`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

router.get('/', async (req, res) => {
    try {
        const allSem = await getSemester();
        res.render('profile.ejs', { title: 'profile', semesterInfo: allSem });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/data', async (req, res) => {
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);
    if (!account) { return res.status(500).send('Error fetching user data'); }
    res.json({ name: account.name, surname: account.surname, email: account.email})
});

router.post('/name', async (req, res) => {
    // Retrieve the password, new name and new surname from the request body
    const { password, newName, newSurname } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if password is correct
    if (!await database.comparePassword(password, account.password)) { return res.status(403).send('Incorrect password'); }

    // Update the username
    if (database.updateUsername(userId, newName, newSurname)) { return res.status(200).send('Name updated'); }

    return res.status(500).send('Error updating name');
});

router.post('/password', async (req, res) => {
    // Retrieve the old password, new password and confirm password from the request body
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if old password is correct
    if (!await database.comparePassword(oldPassword, account.password)) { return res.status(403).send('Incorrect password'); }

    // Hash the new password
    const hashedPassword = await database.hashPassword(newPassword);

    // Update the password
    if (database.updatePassword(userId, hashedPassword)) { return res.status(200).send('Password updated'); }

    return res.status(500).send('Error updating password');
});

router.post('/delete', async (req, res) => {
    // Retrieve the password from the request body
    const { password } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if password is correct
    if (!await database.comparePassword(password, account.password)) { return res.status(403).send('Incorrect password'); }

    // Delete the account
    if (database.deleteAccount(userId)) { return res.status(200).send('Account deleted'); }

    return res.status(500).send('Error deleting account');
});

module.exports = router;

