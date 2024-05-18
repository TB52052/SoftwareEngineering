const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path'); // Import the path module

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

        const filePath = `./json/${req.query.semester}.json`; // semester is in query

        // read JSON file (dynamic)
        const jsonData = fs.readFileSync(filePath);
        const uploadedAssessments = JSON.parse(jsonData);

        // compare and print matching
        const matchingAssessments = allAssessments.filter(assessmentFromDB => {
            return uploadedAssessments.some(uploadedAssessment => {
                return uploadedAssessment.ModuleID === assessmentFromDB.ModuleID &&
                    uploadedAssessment.AssessmentID === assessmentFromDB.AssessmentID;
            });
        });

        console.log("Matching Assessments:", matchingAssessments);

        const id = req.session.user.id;

        // insert matching modules userModules Table
        const insertStmtModule = db.prepare(`INSERT INTO userModules (UserID, ModuleID) VALUES (?, ?)`);
        matchingAssessments.forEach(matchingAssessment => {
            const { AssessmentID, ModuleID } = matchingAssessment;

            // Insert operation
            insertStmtModule.run([id, ModuleID], function(err) {
                if (err) {
                    console.error('Already Exisits in table');
                } else {
                    console.log('Record inserted successfully');
                }
            });
        });
        insertStmtModule.finalize();

        // insert matching modules userModules Table
        const insertStmtAssessment = db.prepare(`INSERT INTO UserAssessments (UserID, AssessmentID) VALUES (?, ?)`);
        matchingAssessments.forEach(matchingAssessment => {
            const { AssessmentID, ModuleID } = matchingAssessment;

            // Insert operation
            insertStmtAssessment.run([id, AssessmentID], function(err) {
                if (err) {
                    console.error('Already Exisits in table');
                } else {
                    console.log('Record inserted successfully');
                }
            });
        });
        insertStmtAssessment.finalize();

        res.render('dashboard.ejs', { title: 'dashboard', AssessmentInfo: allAssessments });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
