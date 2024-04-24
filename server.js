// Modules
const express = require('express'); 
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// App
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false}));

// Database
const db = new sqlite3.Database('./db/users.db',  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {if (err) {console.error(err.message)};});

let create_table = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);`;

db.run(create_table);

function insert_new_account(email, password) {
    db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, password], (err) => {if (err) {console.error(err.message)};});
}

function get_account(email) {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (row) => {return row;});
}

function get_account_password(email) {
    db.get(`SELECT password FROM users WHERE email = ?`, [email], (row) => {return row;});
}

// Get
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

// Post
app.post('/register', async (req, res) => {
    // Check if passwords match
    if (req.body.password !== req.body.confirm) {
        return res.redirect('/register');
    }

    // Check if user exists
    if (get_account(req.body.email)) {
        return res.redirect('/register');
    }

    // Hash password
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        insert_new_account(req.body.email, hashedPassword);
        return res.redirect('/');
    }
    catch {
        return res.redirect('/register');
    }
});

app.post('/login', async (req, res) => {
    // Check if user exists
    if (get_account(req.body.email) === null) {
        console.log('User does not exist');
        return res.redirect('/');
    }

    // Check if password is correct

    // Password is not being retrieved correctly
    var retrieved_password = get_account_password(req.body.email);

    if (!retrieved_password) {
        console.log('Error retrieving password');
        return res.redirect('/');
    }

    if (!(await bcrypt.compare(req.body.password, retrieved_password))) {
        console.log('Incorrect password');
        return res.redirect('/');
    }

    console.log('Login successful');
    return res.redirect('/dashboard');
});

app.listen(3000);