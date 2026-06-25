const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');


document.addEventListener('DOMContentLoaded', loadTasks);

function addTask() {
    const taskText = todoInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    createTaskElement(taskText, false);

    saveTaskToStorage(taskText, false);

    todoInput.value = "";
}

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

    li.addEventListener('click', function(e) {
        if (e.target !== deleteBtn) {
            li.classList.toggle('completed');
            updateStorage(); 
        }
    });

    deleteBtn.addEventListener('click', function() {
        li.remove();
        updateStorage(); 
    });
}

function saveTaskToStorage(text, isCompleted) {
    let tasks = getTasksFromStorage();
    tasks.push({ text: text, completed: isCompleted });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    let tasks;
    if (localStorage.getItem('tasks') === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
    }
    return tasks;
}

function loadTasks() {
    let tasks = getTasksFromStorage();
    tasks.forEach(function(task) {
        createTaskElement(task.text, task.completed);
    });
}

function updateStorage() {
    let tasks = [];
    const listItems = todoList.querySelectorAll('li');
    
    listItems.forEach(function(li) {
        tasks.push({
            text: li.firstChild.textContent, 
            completed: li.classList.contains('completed')
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
});
