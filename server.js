// Modules
const express = require('express'); 
const session = require('express-session');
const dotenv = require('dotenv').config();

// App
const app = express();
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
const loginRoute = require('./routes/login_route');
const registerRoute = require('./routes/register_route');
const calendarRoute = require('./routes/calendar_route');
const tasksRoute = require('./routes/tasks_route');
const dashboardRoute = require('./routes/dashboard_route');
const profileRoute = require('./routes/profile_route');
const logoutRoute = require('./routes/logout_route');

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

app.listen(PORT);