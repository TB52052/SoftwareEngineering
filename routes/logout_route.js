const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    console.log('2');
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.sendStatus(500);
        } else {
        res.redirect('/login');
        }
    });
});

module.exports = router;