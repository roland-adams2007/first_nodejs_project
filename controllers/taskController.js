const asyncHandler = require('express-async-handler');
const connectDB = require('../config/dbConnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { responseHandler } = require('../middleware/responseHandler');


const getTasks = asyncHandler(async function (req, res) {

    const connection = await connectDB();

    const [tasks] = await connection.execute(
        `SELECT 
            id,
            title,
            category,
            due_date,
            created_at AS start_date,
            completed,
            DATEDIFF(due_date, created_at) AS due_in_days,
            CASE 
                WHEN due_date < NOW() THEN 'Expired'
                WHEN DATEDIFF(due_date, NOW()) = 0 THEN 'Due Today'
                WHEN DATEDIFF(due_date, NOW()) <= 3 THEN 'Due Soon'
                ELSE 'Active'
            END AS status
        FROM tasks 
        WHERE user_id = ?`,
        [req.user.id]
    );

    if (!tasks) {
        res.status(500);
        throw new Error("Database error while fetching contacts");
    }

    res.status(200);
    responseHandler(res, tasks, 'Fetched');
})

const getTaskStats = asyncHandler(async function (req, res) {
    const connection = await connectDB();

    const [stats] = await connection.execute(
        `SELECT
        COALESCE(COUNT(*), 0) AS total_tasks,
        COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS completed,
        COALESCE(SUM(CASE WHEN completed = 0 AND due_date >= NOW() THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN completed = 0 AND due_date < NOW() THEN 1 ELSE 0 END), 0) AS overdue
     FROM tasks
     WHERE user_id = ?`,
        [req.user.id]
    );

    res.status(200);
    responseHandler(res, stats[0], 'Task stats fetched');

});


const createTask = asyncHandler(async function (req, res) {


    const { title, category, due_date } = req.body;

    if (!title || !category || !due_date) {
        res.status(400);
        throw new Error('ALl fields are required');
    }
    const connection = await connectDB();
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [titleCheck] = await connection.execute('SELECT * FROM tasks WHERE title = ?', [title]);

    let newTitle = title;

    if (titleCheck.length > 0) {
        newTitle = `${title}-${titleCheck.length + 1}`;
    }

    const [insertResult] = await connection.execute("INSERT into tasks(user_id, title,category,due_date,created_at,completed) VALUES(?,?,?,?,?,?)", [req.user.id, newTitle, category, due_date, createdAt, false]);

    if (!insertResult.insertId) {
        res.status(500);
        throw new Error("Failed to insert task");
    }

    res.status(200);
    responseHandler(res, null, "Task Added.");
})

const updateTask = asyncHandler(async (req, res) => {
    const { completed } = req.body;
    const { id } = req.params;
    if (!id) {
        res.status(400);
        throw new Error('Choose a valid task to delete');
    }

    const connection = await connectDB();

    // taskRows is the actual array of results
    const [taskRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ? LIMIT 1',
        [id]
    );

    if (taskRows.length < 1) {
        res.status(404);
        throw new Error("Task not found");
    }

    const task = taskRows[0];

    if (task.user_id != req.user.id) {
        res.status(403);
        throw new Error("User does not have pemission to update this contact");
    }


    await connection.execute('UPDATE tasks SET completed = ? WHERE id = ?', [completed || 0, id]);
    res.status(200);
    responseHandler(res, null, 'Updated Successfully');
})



const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400);
        throw new Error('Choose a valid task to delete');
    }

    const connection = await connectDB();

    // taskRows is the actual array of results
    const [taskRows] = await connection.execute(
        'SELECT * FROM tasks WHERE id = ? LIMIT 1',
        [id]
    );

    if (taskRows.length < 1) {
        res.status(404);
        throw new Error("Task not found");
    }

    const task = taskRows[0];

    if (task.user_id != req.user.id) {
        res.status(403);
        throw new Error("User does not have pemission to delete this contact");
    }

    await connection.execute("DELETE FROM tasks WHERE id = ?", [id]);

    res.status(200);
    responseHandler(res, null, 'Deleted Successfully');
});


module.exports = {
    getTasks,
    createTask,
    getTaskStats,
    updateTask,
    deleteTask
};