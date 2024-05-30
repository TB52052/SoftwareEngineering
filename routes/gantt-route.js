const express = require('express');
const router = express.Router();
const db = require('../database/database.js');

router.get('/', (req, res) => {
    res.render('gantt.ejs');
});

module.exports = router;