const express = require('express');
const router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
    res.render('dashboard.ejs', { title: 'Dashboard'});
});