const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('tasks.ejs', { title: 'Tasks'});
});

module.exports = router;