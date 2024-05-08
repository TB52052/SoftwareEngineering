const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./db/study_planner.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});
const NUMBER_OF_HASHES = 13;

function getAccount(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Users WHERE email = ?`, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function insertNewAccount(email, password) {
    db.run(`INSERT INTO Users (email, password) VALUES (?, ?)`, [email, password], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, NUMBER_OF_HASHES, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

function comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function getUserAssessments(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
            UserAssessments.*, 
            Assessments.AssessmentName, Assessments.ModuleID
                FROM UserAssessments
                JOIN Assessments ON UserAssessments.AssessmentID = Assessments.AssessmentID
            WHERE UserAssessments.UserID = ?
        `;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getUserTasks(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT 
        StudyTasks.*,
        TaskTypes.TypeName,
        Assessments.AssessmentName,
        Modules.ModuleName
            FROM StudyTasks
            JOIN TaskTypes ON StudyTasks.TaskTypeID = TaskTypes.TaskTypeID
            JOIN Assessments ON StudyTasks.AssessmentID = Assessments.AssessmentID  
            JOIN Modules ON Assessments.ModuleID = Modules.ModuleID  
            WHERE StudyTasks.UserID = ?
        `;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


module.exports = {
    getAccount,
    insertNewAccount,
    hashPassword,
    comparePassword,
    getUserAssessments,
    getUserTasks
};