const express = require("express");
const router = express.Router();
const database = require("../database/database.js");

const fs = require('fs');
const { Module } = require("module");

router.get("/", async (req, res) => {
    res.render("profile.ejs");
});

router.get("/user-data", async (req, res) => {
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);
    if (!account) {
        return res.status(500).send("Error fetching user data");
    }
    return res.json({ name: account.Forename, surname: account.Surname, email: account.Email });
});


router.get("/semester-data", async (req, res) => {
    const userId = req.session.user.id;
    const semesters = await database.getSemesters(userId);
    if (!semesters) {
        return res.status(500).send("Error fetching semester data");
    }
    return res.json(semesters);
});

router.post("/check-semester", async (req, res) => {
    const userId = req.session.user.id;
    const semesterName = req.body.selectedSemester;
    const semesterID = await database.getSemesterID(semesterName);
    console.log(semesterID);
    console.log(semesterName);

    let semData = await database.getUserModulesTaylor(userId, semesterID);

    return res.json({exists: semData.length > 0, semesterData: semData});
});

router.post("/name", async (req, res) => {
    // Retrieve the password, new name and new surname from the request body
    const { password, newName, newSurname } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if password is correct
    if (!(await database.comparePassword(password, account.Password))) {
        return res.status(403).send("Incorrect password");
    }

    // Update the username
    if (database.updateUsername(userId, newName, newSurname)) {
        return res.status(200).send("Name updated");
    }

    return res.status(500).send("Error updating name");
});

router.post("/password", async (req, res) => {
    // Retrieve the old password, new password and confirm password from the request body
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if old password is correct
    if (!(await database.comparePassword(oldPassword, account.Password))) {
        return res.status(403).send("Incorrect password");
    }

    // Hash the new password
    const hashedPassword = await database.hashPassword(newPassword);

    // Update the password
    if (database.updatePassword(userId, hashedPassword)) {
        return res.status(200).send("Password updated");
    }

    return res.status(500).send("Error updating password");
});

router.post("/delete", async (req, res) => {
    // Retrieve the password from the request body
    const { password } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if password is correct
    if (!(await database.comparePassword(password, account.Password))) {
        return res.status(403).send("Incorrect password");
    }

    // Delete the account
    let deleteAccount = await database.deleteAccount(userId);
    await database.deleteTasks(userId);

    if (!deleteAccount) {
        return res.status(200).send("Account deleted");
    }

    return res.status(500).send("Error deleting account");
});

router.post("/upload", async (req, res) => {
    try {
        const semester = req.body.semester;
        const modules = req.body.modules;
        const userID = req.session.user.id;
        const semesterID = await database.getSemesterID(semester);

        for (const module of modules) {
            const rows = await database.checkModule(module);
            if (rows.length === 0) {
                return res.status(400).send({ message: 'Invalid module found' });
            }
        }

        // Insert valid modules
        await Promise.all(modules.map(module => database.insertUserModule(userID, module, semesterID)));

        return res.status(200).send({ message: 'Semester uploaded successfully' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
});


module.exports = router;


