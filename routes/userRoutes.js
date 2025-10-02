const express = require('express');
const { loginUser, registerUser, getCurrentUser, logoutUser } = require('../controllers/userController');
const validateTokenHandler = require('../middleware/validateTokenHandler');
const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/current', validateTokenHandler, getCurrentUser);

module.exports = router;