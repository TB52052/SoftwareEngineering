const express = require("express");
const router = express.Router();
const database = require('../database/database.js');

router.get("/", (req, res) => {
    return res.render("login.ejs");
});

router.post("/", async (req, res) => {
    try {
        const account = await database.getAccount(req.body.email);
        if (!account || account.Password === undefined) {
            req.session.message = "Account not found.";
            req.session.isError = true;
            return res.redirect("/login");
        }

        if (req.body.password === "" || req.body.email === "") {
            req.session.message = "Please enter all data.";
            req.session.isError = true;
            return res.redirect("/login");
        }

        if (!(await database.comparePassword(req.body.password, account.Password))) {
            req.session.message = "Invalid credentials.";
            req.session.isError = true;
            return res.redirect("/login");
        }

        req.session.user = { id: account.UserID, email: account.Email};

        return res.redirect('/profile');
    } catch (error) {
        req.session.message = "Internal Server Error";
        req.session.isError = true;
        return res.status(500).send(error.message);
    }
});

module.exports = router;
