// Modules
const express = require('express'); 

// App
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

// Routes
const loginRoute = require('./routes/login_route');
const registerRoute = require('./routes/register_route');

app.use('/login', loginRoute);
app.use('/register', registerRoute);

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.listen(PORT);