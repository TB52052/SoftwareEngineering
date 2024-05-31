const express = require('express');
const router = express.Router();
const db = require('../database/database.js');

router.get('/', (req, res) => {
    res.render('gantt.ejs');
});

router.get('/:taskId/activities', async (req, res) => {
    const { taskId } = req.params;
    try {
        const activities = await db.getUserActivitiesForTask(taskId);
        res.status(200).json(activities);
    } catch (err) {
        console.error('Error fetching activities:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;