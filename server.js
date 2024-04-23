const express = require('express'); 
const bcrypt = require('bcrypt');
const app = express();

// Change this
const users = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

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

app.post('/register', async (req, res) => {
    if (req.body.password !== req.body.confirm) {
        console.log('Passwords do not match');
        return res.redirect('/register');
    }

    if (users.find(user => user.email === req.body.email)) {
        console.log('Username already exists');
        return res.redirect('/register');
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            username: req.body.email,
            password: hashedPassword
        });
        console.log('User has been created');
        res.redirect('/');
    }
    catch {
        console.log('Error');
        res.redirect('/register');
    }
});

app.post('/login', async (req, res) => {
    const user = users.find(user => user.email === req.body.email);
    if (user == null) {
        return res.redirect('/');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.redirect('/dashboard');
        } else {
            res.redirect('/');
        }
    }
    catch {
        res.redirect('/');
    }
});

app.listen(3000);