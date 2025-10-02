const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECURE_LS_SECRET;

const protect = (req, res, next) => {
    const token = req.cookies?.t_accessToken;
    console.log({ token, cookies: req.cookies });

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user;
        next();
    } catch (err) {
        return res.redirect('/login');
    }
};

module.exports = protect;
