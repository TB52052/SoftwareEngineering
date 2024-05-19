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

function updateUsername(userId, newName, newSurname) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE Users SET name = ?, surname = ? WHERE UserID = ?`, [newName, newSurname, userId], (err) => {
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
        db.run(`UPDATE Users SET password = ? WHERE UserID = ?`, [newPassword, userId], (err) => {
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

function getUserModules(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
            UserModules.*, 
            Modules.ModuleName
                FROM UserModules
                JOIN Modules ON UserModules.ModuleID = Modules.ModuleID
            WHERE UserModules.UserID = ?
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

function insertUserAssessment(userID, assessmentID, semesterID) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO UserAssessments (UserID, AssessmentID, SemesterID) VALUES (?, ?, ?)`, [userID, assessmentID, semesterID], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function getAssessment() {
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


module.exports = {
    getAccount,
    insertNewAccount,
    hashPassword,
    comparePassword,
    getUserAssessments,
    getUserTasks,
    updateUsername,
    updatePassword,
    deleteAccount,
    getAccountByID,
    getUserModules,
    getTaskTypes,
    getModule,
    getAssessment,
    deleteTasks,
    deleteAssessments,
    deleteModules,
    getSemesters,
    insertUserModule,
    insertUserAssessment,
    getAssessment,
    getSemesterID
};
