const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.sendStatus(500);
        } else {
            res.redirect("/login");
        }
    });
});

module.exports = router;
