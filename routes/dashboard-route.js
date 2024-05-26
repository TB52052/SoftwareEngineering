const express = require('express');
const router = express.Router();
const db = require('../database/database.js');



router.get('/', async (req, res) => {
    res.render('dashboard.ejs' , {title: 'Dashboard'});
});

module.exports = router;