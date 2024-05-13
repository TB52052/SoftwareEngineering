const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./db/study_planner.db');

async function getAssessment() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT AssessmentID, ModuleID FROM Assessments;`, [], (err, rows) => {
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
        const allAssessments = await getAssessment();
        console.log("Assessments from Database:", allAssessments);

        // read JSON file (needs to be dynamic)
        const jsonData = fs.readFileSync(`./json/Summer 2023-2024.json`);
        const uploadedAssessments = JSON.parse(jsonData);


        // compare and print matching
        const matchingAssessments = allAssessments.filter(assessmentFromDB => {
            return uploadedAssessments.some(uploadedAssessment => {
                return uploadedAssessment.ModuleID === assessmentFromDB.ModuleID 
                    && uploadedAssessment.AssessmentID === assessmentFromDB.AssessmentID;
            });
        });

        console.log("Matching Assessments:", matchingAssessments);

        res.render('dashboard.ejs', { title: 'dashboard', AssessmentInfo: allAssessments });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
