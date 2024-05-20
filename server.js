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

app.use('/login', forceLogout, loginRoute);
app.use('/register', forceLogout, registerRoute);
app.use('/calendar', checkAuth, calendarRoute);
app.use('/tasks', checkAuth, tasksRoute);
app.use('/dashboard', checkAuth, dashboardRoute);
app.use('/profile', checkAuth, profileRoute);
app.use('/logout', logoutRoute);

app.get('/', (req, res) => {
    res.redirect('/profile');
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



app.get('/api/user/:userId/assessments', async (req, res) => {
    console.log("Endpoint Called: Fetching assessments");  // Check if this logs
    const userId = req.params.userId;
    if (!userId) {
        console.log("No userId provided");
        return res.status(400).send("User ID is required");
    }
    try {
        const assessments = await db.getUserAssessments(userId);
        console.log("Assessments:", assessments);  // Log the data fetched
        res.json(assessments);
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).send(err.message);
    }
});


app.get('/api/user/:userId/tasks', async (req, res) => {
    console.log("Endpoint Called: Fetching ");  // Check if this logs
    try {
        const userId = req.params.userId;
        const tasks = await db.getUserTasks(userId);
        res.json(tasks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT);