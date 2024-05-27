const express = require('express');
const router = express.Router();
const db = require('../database/database.js');


router.get('/', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const userId = req.session.user.id;

    try {
        const userTasksData = await db.getUserTasks(userId);
        const modules = await db.getUserModules(userId);
        const assessments = await db.getUserAssessments(userId);
        const taskTypes = await db.getTaskTypes();

        const userTasks = [];
        const tasksMap = new Map();

        // Fetch milestones for each task
        for (const taskData of userTasksData) {
            if (!tasksMap.has(taskData.TaskID)) {
                const task = {
                    ...taskData,
                    activities: [],
                    milestones: [] // Initialize milestones array
                };
                tasksMap.set(taskData.TaskID, task);
                userTasks.push(task);
            }
        
            const task = tasksMap.get(taskData.TaskID);
            const milestones = await db.getMilestonesForTask(taskData.TaskID);
            task.milestones = milestones; // Assign milestones to the task object
        }

        res.render('tasks', { tasks: userTasks, modules, assessments, taskTypes, userId, user: req.session.user });
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).send("Internal Server Error");
    }
});



// Endpoint to fetch ProgressMeasurement options based on TaskTypeID
router.get('/progress-measurements/:taskTypeId', async (req, res) => {
    const { taskTypeId } = req.params;

    try {
        // Retrieve progress measurements based on TaskTypeID from the database
        const progressMeasurements = await db.getProgressMeasurementsByTaskType(taskTypeId);
        res.json(progressMeasurements);
    } catch (err) {
        console.error('Error retrieving progress measurements:', err.message);
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

        // Insert the task first
        const taskID = await db.insertNewTask(assessmentID, userId, taskTypeID, timeSpent, taskDate, taskName, moduleID, quantity);

        // Ensure milestoneName and milestoneDeadline are arrays
        const milestones = Array.isArray(milestoneName) ? milestoneName : [milestoneName];
        const deadlines = Array.isArray(milestoneDeadline) ? milestoneDeadline : [milestoneDeadline];

        const dependencies = Array.isArray(taskDependencies) ? taskDependencies : [taskDependencies];

        for (let i = 0; i < milestones.length; i++) {
            await db.insertNewMilestone(taskID, [milestones[i]], [deadlines[i]]);
        }

       // Handle task dependencies
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
    const { taskId, hoursSpent, amountDone, progressMeasurement, quantity, notes } = req.body;

    try {
        console.log(`Updating progress for task ${taskId}: hoursSpent=${hoursSpent}, amountDone=${amountDone}, progressMeasurement=${progressMeasurement}, quantity=${quantity}, notes=${notes}`);
        await db.updateTaskProgress(taskId, hoursSpent, amountDone, progressMeasurement, quantity, notes);
        res.status(200).send('Progress updated successfully.');
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).send('Error updating progress.');
    }
});


// Endpoint to add a new activity
router.post('/activities', async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Extract data from the request body
    const { quantity, notes, progressMeasurement } = req.body;

    // Retrieve userId, taskId, and taskTypeId from the session or task context
    const userId = req.session.user.id;
    const taskId = req.session.currentTask.id;
    const taskTypeId = req.session.currentTask.typeId;

    try {
        // Insert new activity into the database
        await db.insertNewActivity(userId, taskId, taskTypeId, quantity, notes, progressMeasurement);
        res.redirect('/tasks'); // Redirect to tasks page after adding activity
    } catch (err) {
        console.error('Error inserting new activity:', err.message);
        res.status(500).send("Internal Server Error");
    }
});


// Route to update task status
router.put('/:taskId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { taskId } = req.params;
    const { status } = req.body;

    try {
        await db.updateTaskStatus(taskId, status);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating task status:', err.message);
        res.status(500).send("Internal Server Error");
    }
});
// Route to update a task's deadline
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

router.put('/milestone/:milestoneId', async (req, res) => {
    const { newDeadline } = req.body;
    const { milestoneId } = req.params;

    try {
        await db.updateMilestoneDeadline(milestoneId, newDeadline);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating milestone deadline:', err.message);
        res.status(500).send("Internal Server Error");
    }
});


module.exports = router;
