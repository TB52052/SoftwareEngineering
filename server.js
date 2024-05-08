// Modules
const express = require('express'); 
const session = require('express-session');
const dotenv = require('dotenv').config();
const dbHelpers = require('./database.js'); 

// App
const app = express();
app.use(express.json());
const PORT = 3000;

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

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {    
    // Check if user is authenticated
    if (!req.session.user) {
        res.redirect("/login");
    }

    if (req.session.cookie.expires < Date.now()) {
        req.session.destroy();
        return res.redirect("/login");
    }

    return next();
};

const forceLogout = (req, res, next) => {
    if (req.session.user) {
        req.session.destroy();
    }
    return next();
}

// Routes
const loginRoute = require('./routes/login-route');
const registerRoute = require('./routes/register-route');
const calendarRoute = require('./routes/calendar-route');
const tasksRoute = require('./routes/tasks-route');
const dashboardRoute = require('./routes/dashboard-route');
const profileRoute = require('./routes/profile-route');
const logoutRoute = require('./routes/logout-route');

app.use('/login',forceLogout, loginRoute);
app.use('/register', forceLogout, registerRoute);
app.use('/calendar', checkAuth, calendarRoute);
app.use('/tasks', checkAuth, tasksRoute);
app.use('/dashboard', checkAuth, dashboardRoute);
app.use('/profile', checkAuth, profileRoute);
app.use('/logout', logoutRoute);

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.get('/get-session-message', (req, res) => {
    res.json(req.session.message);
});

app.get('/clear-session-message', (req, res) => {
    req.session.message = null;
    res.json(true);
});

app.get('/api/user/:userId/assessments', async (req, res) => {
    console.log("Endpoint Called: Fetching assessments");  // Check if this logs
    const userId = req.params.userId;
    if (!userId) {
        console.log("No userId provided");
        return res.status(400).send("User ID is required");
    }
    try {
        const assessments = await dbHelpers.getUserAssessments(userId);
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
        const tasks = await dbHelpers.getUserTasks(userId);
        res.json(tasks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT);