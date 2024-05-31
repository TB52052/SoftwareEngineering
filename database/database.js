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
            a.AssessmentID,
            a.ModuleID,
            a.AssessmentType,
            a.AssessmentName,
            a.AssessmentDescription,
            a.AssessmentDate,
            a.Weighting,
            m.ModuleName
        FROM 
            Assessments a
        JOIN 
            Modules m ON a.ModuleID = m.ModuleID
        JOIN 
            UserModules um ON m.ModuleID = um.ModuleID
        WHERE 
            um.UserID = ?
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

function getUserModulesTaylor(userID, semesterID) {
    console.log(userID, semesterID);
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM UserModules WHERE UserID = ? AND SemesterID = ?`;
        db.all(query, [userID, semesterID], (err, rows) => {
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

function checkModule(moduleID) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM Modules WHERE ModuleID = ?`;
        db.all(query, [moduleID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function updateTaskStatus(taskId, status) { 
    return new Promise((resolve, reject) => { 
        const query = `UPDATE StudyTasks SET Status = ? WHERE TaskID = ?`; 
        db.run(query, [status, taskId], (err) => { 
            if (err) { 
                reject(err); 
            } else { 
                resolve(); 
            } 
        }); 
    }); 
} 
function getProgressMeasurementsByTaskType(taskTypeId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT ProgressMeasurement FROM TaskTypeProgressMeasurements WHERE TaskTypeID = ?';
        db.all(sql, [taskTypeId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const progressMeasurements = rows.map(row => row.ProgressMeasurement);
                resolve(progressMeasurements);
            }
        });
    });
}

function updateTaskProgress(taskId, hoursSpent, amountDone) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE UserTasks
            SET HoursSpent = ?, AmountDone = ?
            WHERE TaskID = ?
        `;
        db.run(query, [hoursSpent, amountDone, taskId], (err) => {
            if (err) {
                console.error('Error updating task progress:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}


function insertNewMilestone(taskId, milestoneNames, milestoneDeadlines) { 
    return new Promise((resolve, reject) => { 
        if (!Array.isArray(milestoneNames) || !Array.isArray(milestoneDeadlines)) { 
            reject(new Error('Milestone names and deadlines must be arrays')); 
            return; 
        } 
        const query = ` 
            INSERT INTO Milestones (TaskID, MilestoneName, MilestoneDeadline) 
            VALUES (?, ?, ?) 
        `;

        Promise.all(milestoneNames.map((name, index) => { 
            return new Promise((resolve, reject) => { 
                db.run(query, [taskId, name, milestoneDeadlines[index]], (err) => { 
                    if (err) { 
                        console.error('Error inserting milestone:', err); 
                        reject(err); 
                    } else { 
                        resolve(); 
                    } 
                }); 
            }); 
        })) 
        .then(() => { 
            console.log('All milestones inserted successfully'); 
            resolve(); 
        }) 
        .catch((error) => { 
            console.error('Error inserting milestones:', error); 
            reject(error); 
        }); 
    }); 
} 


function getMilestonesForTask(taskID) { 
    return new Promise((resolve, reject) => { 
        const query = ` 
            SELECT * FROM Milestones 
            WHERE TaskID = ? 
        `; 
        db.all(query, [taskID], (err, rows) => { 
            if (err) { 
                console.error('Error retrieving milestones:', err); 
                reject(err); 
            } else { 
                resolve(rows); 
            } 
        }); 
    }); 
} 

function updateMilestoneDeadline(milestoneId, newDeadline) {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE Milestones
            SET MilestoneDeadline = ?
            WHERE MilestoneID = ?
        `;
        db.run(query, [newDeadline, milestoneId], function(err) {
            if (err) {
                console.error('Error updating milestone deadline:', err);
                reject(err);
            } else {
                console.log(`Milestone ${milestoneId} deadline updated to ${newDeadline}`); 
                resolve();
            }
        });
    });
}





function insertNewDependency(taskID, dependencyID) { 
    return new Promise((resolve, reject) => { 
        const query = ` 
            INSERT INTO Dependencies (TaskID, DependencyID) 
            VALUES (?, ?) 
        `; 
        db.run(query, [taskID, dependencyID], function(err) { 
            if (err) { 
                console.error('Error inserting new dependency:', err); 
                reject(err); 
            } else { 
                resolve(this.lastID); 
            } 
        }); 
    }); 
} 

 


function getDependencies(taskID) { 
    return new Promise((resolve, reject) => { 
        const query = ` 
            SELECT DependencyID FROM Dependencies WHERE TaskID = ? 
        `; 
        db.all(query, [taskID], function(err, rows) { 
            if (err) { 
                console.error('Error getting dependencies:', err); 
                reject(err); 
            } else { 
                resolve(rows);  
            } 
        }); 
    }); 
} 


function updateTaskDeadline(taskID, newDeadline) { 
    return new Promise((resolve, reject) => { 
        const query = ` 
            UPDATE StudyTasks 
            SET TaskDate = ? 
            WHERE TaskID = ? 
        `; 
        db.run(query, [newDeadline, taskID], function(err) { 
            if (err) { 
                console.error('Error updating task deadline:', err); 
                reject(err); 
            } else { 
                resolve(this.changes); 
            } 
        }); 
    }); 
} 

function getUserModuleAssessments(userID, moduleID) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT Assessments.*
            FROM UserModules
            JOIN Assessments ON UserModules.ModuleID = Assessments.ModuleID
            WHERE UserModules.UserID = ? AND UserModules.ModuleID = ?
        `;
        db.all(query, [userID, moduleID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
function getUserGanttData(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
        SELECT 
            a.AssessmentID,
            a.ModuleID,
            a.AssessmentType,
            a.AssessmentName,
            a.AssessmentDescription,
            a.AssessmentDate,
            a.Weighting,
            m.ModuleName,
            t.TaskID,
            t.TaskName,
            t.TaskDate,
            t.TimeSpent,
            t.Status,
            t.Quantity,
            d.DependencyID
        FROM 
            Assessments a
        JOIN 
            Modules m ON a.ModuleID = m.ModuleID
        JOIN 
            UserModules um ON m.ModuleID = um.ModuleID
        LEFT JOIN 
            StudyTasks t ON a.AssessmentID = t.AssessmentID
        LEFT JOIN 
            Dependencies d ON t.TaskID = d.TaskID
        WHERE 
            um.UserID = ?
        ORDER BY 
            a.AssessmentDate, t.TaskDate;
        `;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error('Error executing SQL:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}





function getUserActivitiesForTask(taskID) { 
    return new Promise((resolve, reject) => { 
        const query = ` 
            SELECT * FROM UserActivities 
            WHERE TaskID = ? 
        `; 
        db.all(query, [taskID], (err, rows) => { 
            if (err) { 
                console.error('Error retrieving activities:', err); 
                reject(err); 
            } else { 
                resolve(rows);  
            } 
        }); 
    }); 
} 

function getTaskById(taskId) {
    return new Promise((resolve, reject) => {
        const query = `
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
            WHERE StudyTasks.TaskID = ?
        `;
        db.get(query, [taskId], (err, row) => {
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
    getUserModulesTaylor,
    getTaskTypes,
    getSemesters,
    insertUserModule,
    getSemesterID,
    getUserSemester,
    insertNewTask,
    insertNewActivity,
    checkModule,
    updateTaskStatus,
    getProgressMeasurementsByTaskType,
    updateTaskProgress,
    insertNewMilestone,
    getMilestonesForTask,
    insertNewDependency,
    getDependencies,
    updateTaskDeadline,
    getUserModuleAssessments,
    getUserGanttData,
    getUserActivitiesForTask,
    updateMilestoneDeadline,
    getTaskById
};

