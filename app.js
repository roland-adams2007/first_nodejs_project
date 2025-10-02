var express = require('express');
const path = require('path');
const { errorHandler } = require('./middleware/responseHandler');
const runMigrations = require('./models/globalModel');
const protect = require('./middleware/protect');
const redirectIfLoggedIn = require('./middleware/redirectIfLoggedIn');
const cookieParser = require('cookie-parser');

var app = express();

const dotenv = require('dotenv').config();
const port = process.env.PORT;

var baseUrl = __dirname;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        await runMigrations();
    } catch (err) {
        process.exit(1);
    }
})();

app.get('/', (req, res) => {
    const token = req.cookies?.t_accessToken;
    if (token) {
        try {
            const user = jwt.verify(token, process.env.SECURE_LS_SECRET);
            return res.redirect('/dashboard');
        } catch (err) {
            return res.redirect('/login');
        }
    } else {
        return res.redirect('/login');
    }
});



app.get('/login', redirectIfLoggedIn, function (req, res) {
    res.sendFile(path.join(baseUrl, 'public/login.html'));
});

app.get('/register', redirectIfLoggedIn, function (req, res) {
    res.sendFile(path.join(baseUrl, 'public/register.html'));
});

app.get('/dashboard', protect, function (req, res) {
    res.sendFile(path.join(baseUrl, 'public/dashboard.html'));
});

app.use("/api/users", require('./routes/userRoutes'));
app.use("/api/tasks", require('./routes/taskRoutes'));


app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            status: 404,
            message: "API route not found"
        });
    }
    res.status(404).sendFile(path.join(baseUrl, 'public/404.html'));
});

app.use(errorHandler);

app.listen(port, function () {
    console.log(`Server running on port ${port}`);
});
