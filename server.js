const express = require('express'); 
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.post('/register', (req, res) => {
});

app.post('/login', (req, res) => {
});

app.listen(3000);