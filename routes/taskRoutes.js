const express = require('express');
const validateTokenHandler = require('../middleware/validateTokenHandler');
const { getTasks, createTask, getTaskStats, updateTask, deleteTask } = require('../controllers/taskController');
const router = express.Router();


router.use(validateTokenHandler);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.route('/stats').get(getTaskStats);
module.exports = router;