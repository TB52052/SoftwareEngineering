const express = require('express');
const router = express.Router();
const { getUserModules, getUserAssessments, getTaskTypes } = require('../database');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/study_planner.db');

async function getTasks() {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT StudyTasks.*, Modules.ModuleID, Modules.ModuleName, Assessments.AssessmentName, TaskTypes.TypeName, TaskTypes.ProgressMeasurement 
            FROM StudyTasks 
            LEFT JOIN Modules ON StudyTasks.ModulesID = Modules.ModuleID
            LEFT JOIN Assessments ON StudyTasks.AssessmentID = Assessments.AssessmentID
            LEFT JOIN TaskTypes ON StudyTasks.TaskTypeID = TaskTypes.TaskTypeID
        `;
        db.all(sql, [], (err, rows) => {
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
        const userId = req.session.user.UserID;
        const allTasks = await getTasks();
        const allModules = await getUserModules(userId);
        const allAssessments = await getUserAssessments(userId);
        const allTaskTypes = await getTaskTypes();

        console.log(allTasks);

        res.render('tasks', {
            tasks: allTasks,
            modules: allModules,
            assessments: allAssessments,
            taskTypes: allTaskTypes,
            userId: userId,
            title: 'Tasks'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res) => {
    const { taskName, module, assessment, timeSpent, taskRequirement, progressMeasurement, taskDeadline, userId } = req.body;

    const sql = `
        INSERT INTO StudyTasks (TaskName, ModuleID, AssessmentID, TimeSpent, TaskTypeID, ProgressMeasurement, TaskDate, UserID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [taskName, module, assessment, timeSpent, taskRequirement, progressMeasurement, taskDeadline, userId], function(err) {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.redirect('/tasks');
    });
});

module.exports = router;