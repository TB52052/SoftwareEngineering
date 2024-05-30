// Modules
require ('dotenv').config();
const express = require('express'); 
const session = require('express-session');
const db = require('./database/database.js'); 
const { checkAuth, forceLogout } = require('./middleware/authenticator.js');
const { getSessionMessage, clearSessionMessage } = require('./middleware/message-handler.js');

// App
const PORT = 3000;
const app = express();
app.use(express.json());


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

// Session
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 600000}
}));

// Routes
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const calendarRoute = require('./routes/calendar-route');
const tasksRoute = require('./routes/tasks-route');
const dashboardRoute = require('./routes/dashboard-route');
const profileRoute = require('./routes/profile-route');
const logoutRoute = require('./routes/logout-route');
const ganttRoute = require('./routes/gantt-route');

app.use('/login', forceLogout, loginRoute);
app.use('/register', forceLogout, registerRoute);
app.use('/calendar', checkAuth, calendarRoute);
app.use('/tasks', checkAuth, tasksRoute);
app.use('/dashboard', checkAuth, dashboardRoute);
app.use('/profile', checkAuth, profileRoute);
app.use('/gantt', checkAuth, ganttRoute);
app.use('/logout', logoutRoute);


app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/profile');
    }
    forceLogout(req, res);
    return res.redirect('/login');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.get('/get-session-message', (req, res) => {
    return getSessionMessage(req, res);
});

app.get('/clear-session-message', (req, res) => {
    return clearSessionMessage(req, res);
});


// Endpoint to fetch tasks along with their types
app.get('/api/tasks', (req, res) => {
    db.all(`
        SELECT StudyTasks.*, TaskTypes.TypeName, Modules.ModuleName 
        FROM StudyTasks 
        JOIN TaskTypes ON StudyTasks.TaskTypeID = TaskTypes.TaskTypeID 
        JOIN Modules ON StudyTasks.ModuleID = Modules.ModuleID`, 
        (err, rows) => {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.json(rows);
            }
        });
});

// Endpoint to fetch modules for select options
app.get('/api/modules', (req, res) => {
    db.all("SELECT * FROM Modules", (err, modules) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(modules);
        }
    });
});

// Endpoint to fetch task types for select options
app.get('/api/tasktypes', (req, res) => {
    db.all("SELECT * FROM TaskTypes", (err, types) => {
        if (err) {
            res.status(500).send(err.message);
        } else {
            res.json(types);
        }
    });
});

app.get('/tasks', checkAuth, async (req, res) => {
    try {
        const tasks = await db.getAllTasks();
        res.render('tasks', { tasks });
    } catch (err) {
        console.error('Error fetching tasks:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/task-type-progress-measurements/:taskTypeId', async (req, res) => {
    const { taskTypeId } = req.params;
    try {
        const measurements = await db.getProgressMeasurementsByTaskType(taskTypeId);
        res.status(200).json(measurements);
    } catch (err) {
        console.error('Error fetching task type progress measurements:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/api/user/:userId/assessments', async (req, res) => {
    try {
        const userId = req.params.userId;
        const assessments = await db.getUserAssessments(userId);
        res.json(assessments);
    } catch (err) {
        res.status(500).send(err.message);
    }
});



app.get('/api/user/:userId/tasks', async (req, res) => {
    try {
        const userId = req.params.userId;
        const tasks = await db.getUserTasks(userId);
        res.json(tasks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/progress', async (req, res) => {
    const { taskId, hoursSpent, amountDone } = req.body;

    try {
        await db.updateTaskProgress(taskId, hoursSpent, amountDone);
        
    } catch (err) {
        console.error('Error updating task progress:', err.message);
        res.status(500).send("Internal Server Error");
    }
});
app.post('/activities', async (req, res) => {
    const { userId, taskId, taskTypeId, quantity, notes, progressMeasurement } = req.body;
    try {
        const activity = await db.insertNewActivity(userId, taskId, taskTypeId, quantity, notes, progressMeasurement);
        res.status(200).json(activity);
    } catch (err) {
        console.error('Error inserting new activity:', err.message);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/api/user/:userId/gantt-data', async (req, res) => {
    try {
        const userId = req.params.userId;
        const ganttData = await db.getUserGanttData(userId); 
        res.json(ganttData);
    } catch (err) {
        console.error('Error fetching Gantt data:', err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(PORT);