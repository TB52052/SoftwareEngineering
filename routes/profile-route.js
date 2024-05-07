
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();


const db = new sqlite3.Database('./db/study_planner.db');


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
        console.log(allSem);
        res.render('profile.ejs', { title: 'profile', semesterInfo: allSem });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
