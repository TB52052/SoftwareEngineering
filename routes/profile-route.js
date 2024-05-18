const express = require("express");
const router = express.Router();
const database = require("../database/database.js");

const fs = require('fs');

router.get("/", async (req, res) => {
    try {
        const allSem = await database.getSemesters();
        res.render("profile.ejs", { title: "profile", semesterInfo: allSem });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
    // try {
    //     const allAssessments = await database.getAssessment();

    //     // Retrieve selectedSemester from the query parameters
    //     const selectedSemester = req.query.semester;

    //     const filePath = `./json/${selectedSemester}.json`; // semester is in query

    //     // read JSON file (dynamic)
    //     const jsonData = fs.readFileSync(filePath);
    //     const uploadedAssessments = JSON.parse(jsonData);

    //     // compare and print matching
    //     const matchingAssessments = allAssessments.filter(assessmentFromDB => {
    //         return uploadedAssessments.some(uploadedAssessment => {
    //             return uploadedAssessment.ModuleID === assessmentFromDB.ModuleID &&
    //                 uploadedAssessment.AssessmentID === assessmentFromDB.AssessmentID;
    //         });
    //     });

    //     const id = req.session.user.id;

    //     // insert matchingAssessments into UserAssessments table
    //     // insert modules into UserModules table

    //     res.render('dashboard.ejs', { title: 'dashboard', AssessmentInfo: allAssessments });
    // } catch (error) {
    //     console.error('Error:', error);
    //     res.status(500).send('Internal Server Error');
    // }

});

router.get("/data", async (req, res) => {
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);
    if (!account) {
        return res.status(500).send("Error fetching user data");
    }
    return res.json({ name: account.Forename, surname: account.Surname, email: account.Email });
});

router.post("/name", async (req, res) => {
    // Retrieve the password, new name and new surname from the request body
    const { password, newName, newSurname } = req.body;
    const userId = req.session.user.id;
    const account = await database.getAccountByID(userId);

    // Check if password is correct
    if (!(await database.comparePassword(password, account.password))) {
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
    if (!(await database.comparePassword(oldPassword, account.password))) {
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
    if (!(await database.comparePassword(password, account.password))) {
        return res.status(403).send("Incorrect password");
    }

    // Delete the account
    let deleteAccount = await database.deleteAccount(userId);
    await database.deleteTasks(userId);
    await database.deleteAssessments(userId);

    if (!deleteAccount) {
        return res.status(200).send("Account deleted");
    }

    return res.status(500).send("Error deleting account");
});

router.post("/upload", async (req, res) => {

    console.log(req.body);

    

    });


module.exports = router;
