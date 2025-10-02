const asyncHandler = require('express-async-handler');
const connectDB = require('../config/dbConnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { responseHandler } = require('../middleware/responseHandler');




const loginUser = asyncHandler(async function (req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('All field are required');
    }

    const connection = await connectDB();

    const [userRows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

    if (userRows.length < 1) {
        res.status(400);
        throw new Error('Invaild Credentials');
    }

    const user = userRows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email
            },
        }, process.env.SECURE_LS_SECRET, { expiresIn: "1d" });
        res.status(200);
        responseHandler(res, { accessToken }, "Logged in successfully");

    } else {
        res.status(400);
        throw new Error('Invaild Credentials');
    }

})

const registerUser = asyncHandler(async function (req, res) {
    const { email, password, fullname } = req.body;
    if (!email || !password || !fullname) {
        res.status(400);
        throw new Error('All field are required');
    }


    const connection = await connectDB();

    const [emailCheck] = await connection.query("SELECT * FROM users WHERE email = ?", [email]);

    if (emailCheck.length > 0) {
        res.status(400);
        throw new Error("Email is already taken");
    }
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const hashedPassword = await bcrypt.hash(password, 10);

    const [insertResult] = await connection.query("INSERT INTO users(email,fullname,password,created_at) VALUES(?,?,?,?)", [email, fullname, hashedPassword, createdAt]);


    if (!insertResult.insertId) {
        res.status(500);
        throw new Error("Failed to insert user");
    }

    const accessToken = jwt.sign({
        user: {
            id: insertResult.insertId,
            fullname: fullname,
            email: email
        },
    }, process.env.SECURE_LS_SECRET, { expiresIn: "1d" });
    res.status(200);
    responseHandler(res, { accessToken }, "Registered successfully");
})

const getCurrentUser = asyncHandler(async function (req, res) {
    responseHandler(res, req.user, "Retirved");
})

module.exports = { loginUser, registerUser, getCurrentUser };