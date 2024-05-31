const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/study_planner.db');

router.get('/', async (req, res) => {
    let modules = [];
    let assessments = [];
    const userId = req.session.user.id;
    const selectedModule = req.query.module || null;

    let sql = `SELECT * FROM UserModules 
               JOIN Modules ON UserModules.ModuleID = Modules.ModuleID 
               WHERE UserModules.UserID = ?`;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        modules = rows;

        sql = `SELECT * FROM Assessments 
        WHERE (? IS NULL OR Assessments.ModuleID = ?)`;
 
 db.all(sql, [selectedModule, selectedModule], (err, rows) => {
     if (err) {
         console.error('Error fetching assessments:', err);
     }
     assessments = rows;

            const promises = assessments.map(assessment => {
                return new Promise((resolve, reject) => {
                    sql = `SELECT * FROM StudyTasks WHERE AssessmentID = ?`;
                    db.all(sql, [assessment.AssessmentID], (err, rows) => {
                        if (err) {
                            reject(err);
                        }
                        assessment.tasks = rows;
        
                    
                        const totalTasks = assessment.tasks.length;
                        const completedTasks = assessment.tasks.filter(task => task.Status === 'done').length;
                        assessment.progress = (completedTasks / totalTasks) * 100; // This will be a number between 0 and 100
                        
                        const allTasksCompleted = assessment.tasks.every(task => task.Status === 'done');
                        const deadlineHasPassed = new Date() > new Date(assessment.AssessmentDate);
                        
                        
                        if (allTasksCompleted) {
                            assessment.status = 'Completed';
                        } else if (deadlineHasPassed) {
                            assessment.status = 'Missed';
                        } else {
                            assessment.status = 'Upcoming';
                        }

                        resolve();
                    });
                });
            });

            Promise.all(promises)
            .then(() => {
                res.render('dashboard.ejs', { title: 'Dashboard', modules, assessments, selectedModule });
            })
            .catch(err => {
                console.error('Error fetching tasks:', err);
                res.status(500).send('Error fetching tasks');
            });
        });
    });
});

module.exports = router;
