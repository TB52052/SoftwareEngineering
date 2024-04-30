
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./db/semesterInfo.db');


async function getSemester() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT Season FROM semesterInfo`, [], (err, rows) => {
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
        console.log(allSem);
        res.render('dashboard.ejs', { title: 'dashboard', semesterInfo: allSem });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
