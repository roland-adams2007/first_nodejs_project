
document.getElementById('mobileMenuButton').addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('active');
});


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
const token = getCookie("t_accessToken");

document.getElementById('logoutBtn').addEventListener('click', function () {
    document.cookie = "t_accessToken=; path=/; max-age=0; Secure; SameSite=Strict";
    window.location.href = "/login";
})

function getCurrentUserDetails() {
    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');

    fetch("/api/users/current", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then(res => {
            return res.json();
        })
        .then(res => {
            const { status, message, data } = res;
            if (status != 200) {
                fullname.innerHTML = "Error";
                email.innerHTML = "Error";
                alert(message || "Something went wrong");
                return;
            }

            fullname.innerHTML = data?.fullname || '-';
            email.innerHTML = data?.email || '-';


        })
        .catch(err => {
            fullname.innerHTML = "Error";
            email.innerHTML = "Error";
            alert("Something went wrong");
        })
}

function getTaskStats() {

    const totalTasks = document.getElementById('totalTasks');
    const completed = document.getElementById('completed');
    const pending = document.getElementById('pending');
    const overDue = document.getElementById('overDue');


    fetch("/api/tasks/stats", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then(res => {
            return res.json();
        })
        .then(res => {
            const { status, message, data } = res;

            if (status != 200) {
                totalTasks.innerHTML = "Error";
                completed.innerHTML = "Error";
                pending.innerHTML = "Error";
                overDue.innerHTML = "Error";
                alert(message || "Something went wrong");
                return;
            }

            totalTasks.innerHTML = data?.total_tasks || '-';
            completed.innerHTML = data?.completed || '-';
            pending.innerHTML = data?.pending || '-';
            overDue.innerHTML = data?.overdue || '-';


        })
        .catch(err => {
            totalTasks.innerHTML = "Error";
            completed.innerHTML = "Error";
            pending.innerHTML = "Error";
            overDue.innerHTML = "Error";
            alert("Something went wrong");
        })
}

function getTasks() {

    fetch("/api/tasks", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then(res => {
            return res.json();
        })
        .then(res => {
            const { status, message, data } = res;

            if (status != 200) {
                alert(message || "Something went wrong");
                return;
            }
            renderTasks(data);

        })
        .catch(err => {
            alert("Something went wrong");
        })
}


function renderTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    const categoryColors = {
        work: 'bg-blue-100 text-blue-800',
        personal: 'bg-green-100 text-green-800',
        shopping: 'bg-yellow-100 text-yellow-800',
        health: 'bg-purple-100 text-purple-800'
    };

    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="text-center text-gray-500 py-6">
                No tasks available ✨
            </div>`;
        return;
    }

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        const categoryKey = task.category.toLowerCase();
        const isCompleted = task.completed === 1 || task.completed === true;

        taskItem.className = `task-item p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 ${isCompleted ? 'opacity-70' : ''}`;

        taskItem.innerHTML = `
            <div class="flex items-start sm:items-center flex-1">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                       class="task-checkbox mt-1 sm:mt-0 h-5 w-5 text-purple-500 rounded focus:ring-purple-400" 
                       data-id="${task.id}">
                <div class="ml-4">
                    <h3 class="font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}">
                        ${task.title}
                    </h3>
                    <p class="text-xs text-gray-500">ID: ${task.id}</p>
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-1 rounded-full ${categoryColors[categoryKey] || 'bg-gray-100 text-gray-600'}">
                            ${task.category}
                        </span>
                        <span class="text-xs text-gray-500">
                            Start: ${formatDate(task.start_date)}
                        </span>
                        <span class="text-xs text-gray-500">
                            Due: ${formatDate(task.due_date)}
                        </span>
                        <span class="text-xs text-gray-500">
                            (${task.due_in_days} days left)
                        </span>
                        <span class="text-xs px-2 py-1 rounded-full ${task.status === 'Overdue' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}">
                            ${task.status}
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2 mt-2 sm:mt-0">
                <button class="delete-btn p-2 text-gray-400 hover:text-red-500" data-id="${task.id}">
                    🗑️
                </button>
            </div>
        `;

        taskList.appendChild(taskItem);
    });


    document.querySelectorAll('#taskList .delete-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const taskId = parseInt(this.getAttribute('data-id'));
            if (!confirm("Are you sure you want to delete this task?")) return;
            const lastContent = this.innerHTML;

            try {
                this.disabled = true;
                this.innerHTML = `<span class="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 inline-block"></span>`;

                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();
                if (response.status != 200) {
                    alert(result.message || 'Failed to delete task');
                    return;
                }

                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) tasks.splice(taskIndex, 1);
                renderTasks(tasks);

            } catch (err) {
                alert("An error occurred while deleting task.");
            } finally {
                this.disabled = false;
                this.innerHTML = lastContent;
            }
        });
    });

    document.querySelectorAll('#taskList .task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', async function () {
            const taskId = parseInt(this.getAttribute('data-id'));
            const isChecked = this.checked;

            try {
                this.disabled = true;

                const response = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ completed: isChecked ? 1 : 0 }),
                });

                const result = await response.json();

                if (response.status != 200) {
                    alert(result.message || 'Failed to update task');
                    this.checked = !isChecked;
                    return;
                }
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) tasks[taskIndex].completed = isChecked ? 1 : 0;

                renderTasks(tasks);

            } catch (err) {
                console.error(err);
                this.checked = !isChecked;
                alert("An error occurred while updating task.");
            } finally {
                this.disabled = false;
            }
        });
    });
}


function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}



getTasks();
getCurrentUserDetails();
getTaskStats();



document.getElementById('addTaskForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const category = document.getElementById('taskCategory').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const addTaskBtn = document.getElementById('addTaskBtn');
    const lastBtnContent = addTaskBtn.innerHTML;

    if (title.trim() === '') {
        alert('Please enter a task title');
        return;
    }

    const newTask = {
        title: title,
        category: category,
        due_date: dueDate || new Date().toISOString().split('T')[0],
    };

    addTaskBtn.disabled = true;
    addTaskBtn.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    `;
    fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask)
    })
        .then(res => {
            return res.json();
        })
        .then(res => {
            const { status, message } = res;
            if (status != 200) {
                alert(message || "Something went wrong");
                return;
            }
            alert(message || 'Added successfully');
            getTasks();
        })
        .catch(err => {
            alert("Something went wrong");
        })
        .finally(() => {
            addTaskBtn.disabled = false;
            addTaskBtn.innerHTML = lastBtnContent;
        })


    document.getElementById('addTaskForm').reset();
});

