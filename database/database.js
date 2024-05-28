const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("./database/study_planner.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }
});
const NUMBER_OF_HASHES = 13;

function getAccount(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Users WHERE Email = ?`, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getAccountByID(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Users WHERE UserID = ?`, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function insertNewAccount(email, password, name, surname) {
    db.run(`INSERT INTO Users (Email, Password, Forename, Surname) VALUES (?, ?, ?, ?)`, [email, password, name, surname], (err) => {
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
            StudyTasks.Quantity AS TaskQuantity,
            TaskTypes.TypeName,
            Assessments.AssessmentName,
            Modules.ModuleName,
            UserTasks.HoursSpent,
            UserTasks.AmountDone,
            UserActivities.Quantity AS ActivityQuantity,
            UserActivities.Notes,
            UserActivities.ProgressMeasurement
        FROM StudyTasks
        JOIN TaskTypes ON StudyTasks.TaskTypeID = TaskTypes.TaskTypeID
        JOIN Assessments ON StudyTasks.AssessmentID = Assessments.AssessmentID  
        JOIN Modules ON Assessments.ModuleID = Modules.ModuleID  
        LEFT JOIN UserTasks ON StudyTasks.TaskID = UserTasks.TaskID
        LEFT JOIN UserActivities ON StudyTasks.TaskID = UserActivities.TaskID
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

function updateUsername(userId, newName, newSurname) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE Users SET Forename = ?, Surname = ? WHERE UserID = ?`, [newName, newSurname, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function updatePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE Users SET Password = ? WHERE UserID = ?`, [newPassword, userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteAccount(userId) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM Users WHERE UserID = ?`, [userId], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getModule(moduleId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Modules WHERE ModuleID = ?`, [moduleId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function deleteTasks(userID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM StudyTasks WHERE UserID = ?`, [userID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getAssessment(assessmentId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Assessments WHERE AssessmentID = ?`, [assessmentId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function deleteAssessments(userID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM UserAssessments WHERE UserID = ?`, [userID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function deleteModules(userID) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM UserModules WHERE UserID = ?`, [userID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getUserModules(userID) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT Modules.*
            FROM UserModules
            JOIN Modules ON UserModules.ModuleID = Modules.ModuleID
            WHERE UserModules.UserID = ?
        `;
        db.all(query, [userID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getTaskTypes() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM TaskTypes`, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function getSemesters() {
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

function insertUserModule(userID, moduleID, semesterID) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO UserModules (UserID, ModuleID, SemesterID) VALUES (?, ?, ?)`, [userID, moduleID, semesterID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function getSemesterID(semester) {
    return new Promise((resolve, reject) => {
        const query = `SELECT SemesterID FROM SemesterInfo WHERE Season = ?`;
        db.get(query, [semester], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row ? row.SemesterID : null);
        });
    });
}

function getUserSemester(semesterID, userID) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM UserModules WHERE SemesterID = ? AND UserID = ?`;
        db.get(query, [semesterID, userID], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
}

function insertNewTask(assessmentID, userId, taskTypeID, timeSpent, taskDate, taskName, moduleID, quantity) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO StudyTasks (AssessmentID, UserID, TaskTypeID, TimeSpent, TaskDate, TaskName, ModuleID, Quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [assessmentID, userId, taskTypeID, timeSpent, taskDate, taskName, moduleID, quantity], function (err) {
            if (err) {
                console.error('Error inserting new task:', err);
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function insertNewActivity(userId, taskId, taskTypeId, quantity, notes, progressMeasurement) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO UserActivities (UserID, TaskID, TaskTypeID, Quantity, Notes, ProgressMeasurement)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [userId, taskId, taskTypeId, quantity, notes, progressMeasurement], function (err) {
            if (err) {
                console.error('Error inserting new activity:', err);
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function checkModule(moduleName) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM Modules WHERE ModuleName = ?`, [moduleName], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

module.exports = {
    getAccount,
    getAccountByID,
    insertNewAccount,
    hashPassword,
    comparePassword,
    getUserAssessments,
    getUserTasks,
    updateUsername,
    updatePassword,
    deleteAccount,
    getModule,
    deleteTasks,
    getAssessment,
    deleteAssessments,
    deleteModules,
    getUserModules,
    getTaskTypes,
    getSemesters,
    insertUserModule,
    getSemesterID,
    getUserSemester,
    insertNewTask,
    insertNewActivity,
    checkModule
};
