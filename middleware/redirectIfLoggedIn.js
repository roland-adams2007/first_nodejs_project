const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECURE_LS_SECRET;

const redirectIfLoggedIn = (req, res, next) => {
    const token = req.cookies?.t_accessToken; // same name as above
    if (token) {
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (!err && user) return res.redirect('/dashboard');
            next();
        });
    } else {
        next();
    }
};

module.exports = redirectIfLoggedIn;
