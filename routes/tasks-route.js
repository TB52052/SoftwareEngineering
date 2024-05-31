const express = require('express');
const router = express.Router();
const db = require('../database/database.js');

// Update task progress
const updateTaskProgress = async (taskId, newActivityQuantity) => {
    const task = await db.getTaskById(taskId);
    const totalQuantity = task.HoursSpent + newActivityQuantity;

    if (totalQuantity >= task.TaskQuantity) {
        await db.updateTaskStatus(taskId, 'completed');
    }
    await db.updateTaskProgress(taskId, totalQuantity);
};

// Routes
router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id;

    try {
        const userTasksData = await db.getUserTasks(userId);
        const modules = await db.getUserModules(userId);
        const assessments = [];

        for (const module of modules) {
            const moduleAssessments = await db.getUserModuleAssessments(userId, module.ModuleID);
            assessments.push(...moduleAssessments);
        }

        const taskTypes = await db.getTaskTypes();
        const userTasks = [];
        const tasksMap = new Map();

        for (const taskData of userTasksData) {
            if (!tasksMap.has(taskData.TaskID)) {
                const task = {
                    ...taskData,
                    activities: [],
                    milestones: []
                };
                tasksMap.set(taskData.TaskID, task);
                userTasks.push(task);
            }

            const task = tasksMap.get(taskData.TaskID);
            const milestones = await db.getMilestonesForTask(taskData.TaskID);
            task.milestones = milestones;

            const activities = await db.getUserActivitiesForTask(taskData.TaskID);
            task.activities = activities;
        }

        res.render('tasks', { tasks: userTasks, modules, assessments, taskTypes, userId, user: req.session.user });
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/getModuleAssessments/:moduleID', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { moduleID } = req.params;
    const userId = req.session.user.id;

    try {
        const assessments = await db.getUserModuleAssessments(userId, moduleID);
        res.json(assessments);
    } catch (err) {
        console.error('Error fetching module assessments:', err.message);
        res.status(500).send("Internal Server Error");
    }
});




router.post('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id;
    const { taskName, moduleID, assessmentID, timeSpent, taskTypeID, taskDate, quantity, 'milestoneName[]': milestoneName, 'milestoneDeadline[]': milestoneDeadline, 'taskDependencies[]': taskDependencies } = req.body;

    try {
        console.log('Received Task Data:', req.body);

        if (!taskName || !moduleID || !assessmentID || !timeSpent || !taskTypeID || !taskDate || !quantity) {
            throw new Error('Missing required fields');
        }

        const taskID = await db.insertNewTask(assessmentID, userId, taskTypeID, timeSpent, taskDate, taskName, moduleID, quantity);

        const milestones = Array.isArray(milestoneName) ? milestoneName : [milestoneName];
        const deadlines = Array.isArray(milestoneDeadline) ? milestoneDeadline : [milestoneDeadline];

        const dependencies = Array.isArray(taskDependencies) ? taskDependencies : [taskDependencies];

        for (let i = 0; i < milestones.length; i++) {
            await db.insertNewMilestone(taskID, [milestones[i]], [deadlines[i]]);
        }

        if (dependencies && dependencies.length > 0) {
            for (let i = 0; i < dependencies.length; i++) {
                await db.insertNewDependency(taskID, dependencies[i]);
            }
        }

        res.redirect('/tasks');
    } catch (err) {
        console.error('Error inserting new task:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/progress', async (req, res) => {
    const { taskId, hoursSpent, amountDone, progressMeasurement } = req.body;

    try {
        await db.updateTaskProgress(taskId, hoursSpent, amountDone);
        res.status(200).json({ amountDone, progressMeasurement });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Error updating progress.' });
    }
});



router.put('/milestone/:milestoneId', async (req, res) => {
    const { newDeadline } = req.body;
    const { milestoneId } = req.params;

    try {
        console.log(`Received request to update milestone ${milestoneId} with new deadline ${newDeadline}`);
        await db.updateMilestoneDeadline(milestoneId, newDeadline);
        res.redirect('/tasks');
    } catch (err) {
        console.error('Error updating milestone deadline:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/activities', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { quantity, notes, progressMeasurement } = req.body;
    const userId = req.session.user.id;
    const taskId = req.session.currentTask.id;
    const taskTypeId = req.session.currentTask.typeId;

    try {
        await db.insertNewActivity(userId, taskId, taskTypeId, quantity, notes, progressMeasurement);
        updateTaskDetails(taskId); 
        res.redirect('/tasks');
    } catch (err) {
        console.error('Error inserting new activity:', err.message);
        res.status(500).send("Internal Server Error");
    }
});


router.put('/:taskId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { taskId } = req.params;
    const { status } = req.body;

    try {
        await db.updateTaskStatus(taskId, status);
        res.redirect('/tasks');
    } catch (err) {
        console.error('Error updating task status:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/:taskID', async (req, res) => {
    const { newDeadline } = req.body;
    const { taskID } = req.params;

    try {
        await db.updateTaskDeadline(taskID, newDeadline);
        res.redirect('/tasks');
    } catch (err) {
        console.error('Error updating task deadline:', err.message);
        res.status(500).send("Internal Server Error");
    }
});
router.get('/progress-measurements/:taskTypeId', async (req, res) => {
    const { taskTypeId } = req.params;
    try {
        const measurements = await db.getProgressMeasurementsByTaskType(taskTypeId);
        if (measurements.length === 0) {
            return res.status(404).json({ error: 'No progress measurements found for the given task type ID' });
        }
        res.status(200).json(measurements);
    } catch (err) {
        console.error('Error fetching task type progress measurements:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;