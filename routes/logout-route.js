const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    req.session.destroy((err) => {
        if (err) { return res.sendStatus(500); } 
        return res.redirect("/login");
    });
});

module.exports = router;
