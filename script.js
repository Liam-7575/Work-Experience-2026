// 1. Select the HTML elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

// 2. Load existing tasks from Local Storage when the page opens
document.addEventListener('DOMContentLoaded', loadTasks);

// 3. Function to add a new task
function addTask() {
    const taskText = todoInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    // Create the task element in the UI
    createTaskElement(taskText, false);

    // Save the new task to Local Storage
    saveTaskToStorage(taskText, false);

    // Clear input field
    todoInput.value = "";
}

// 4. Helper function to construct the task HTML elements
function createTaskElement(text, isCompleted) {
    const li = document.createElement('li');
    li.textContent = text;

    if (isCompleted) {
        li.classList.add('completed');
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    li.appendChild(deleteBtn);
    todoList.appendChild(li);

    // Toggle complete state on click
    li.addEventListener('click', function(e) {
        if (e.target !== deleteBtn) {
            li.classList.toggle('completed');
            updateStorage(); // Update storage when a task is checked/unchecked
        }
    });

    // Delete task on click
    deleteBtn.addEventListener('click', function() {
        li.remove();
        updateStorage(); // Update storage when a task is deleted
    });
}

// 5. Save a single task to Local Storage array
function saveTaskToStorage(text, isCompleted) {
    let tasks = getTasksFromStorage();
    tasks.push({ text: text, completed: isCompleted });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 6. Fetch existing tasks array from Local Storage
function getTasksFromStorage() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
}

// 7. Load and render tasks on startup
function loadTasks() {
    let tasks = getTasksFromStorage();
    tasks.forEach(function(task) {
        createTaskElement(task.text, task.completed);
    });
}

// 8. Rewrite the whole storage array when tasks are toggled or deleted
function updateStorage() {
    let tasks = [];
    const listItems = todoList.querySelectorAll('li');
    
    listItems.forEach(function(li) {
        tasks.push({
            text: li.firstChild.textContent, // Get the text, ignoring the button text
            completed: li.classList.contains('completed')
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 9. Event Listeners for user actions
addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
