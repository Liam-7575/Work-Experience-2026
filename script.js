document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const taskCount = document.getElementById('task-count');
    
    const priorityOptions = document.querySelectorAll('.priority-option');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const settingsCard = document.getElementById('settings-card');
    const settingsSort = document.getElementById('settings-sort');
    const wipeStorageBtn = document.getElementById('wipe-storage-btn');

    let activePriority = 'low';
    let taskDataArray = JSON.parse(localStorage.getItem('saved_todo_tasks')) || [];
    let currentSortOption = localStorage.getItem('saved_todo_sort') || 'none';

    const priorityWeightMap = { 'high': 3, 'medium': 2, 'low': 1 };

    if (localStorage.getItem('saved_todo_theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    }

    settingsSort.value = currentSortOption;
    renderTasksEngine();

    priorityOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            priorityOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            activePriority = option.getAttribute('data-priority');
        });
    });

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('saved_todo_theme', 'dark');
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('saved_todo_theme', 'light');
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
        }
        setTimeout(() => {
            const items = todoList.querySelectorAll('li');
            items.forEach(item => calculateScrollDistance(item));
        }, 100);
    });

    openSettingsBtn.addEventListener('click', () => settingsCard.classList.add('active'));
    closeSettingsBtn.addEventListener('click', () => settingsCard.classList.remove('active'));
    
    settingsSort.addEventListener('change', (e) => {
        currentSortOption = e.target.value;
        localStorage.setItem('saved_todo_sort', currentSortOption);
        renderTasksEngine();
    });

    wipeStorageBtn.addEventListener('click', () => {
        if (confirm("Reset everything? History will be cleared completely.")) {
            localStorage.clear();
            taskDataArray = [];
            currentSortOption = 'none';
            settingsSort.value = 'none';
            document.documentElement.removeAttribute('data-theme');
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
            settingsCard.classList.remove('active');
            renderTasksEngine();
        }
    });

    function saveToLocalStorage() {
        localStorage.setItem('saved_todo_tasks', JSON.stringify(taskDataArray));
    }

    function animateCounter(type) {
        const className = type === 'up' ? 'pulse-up' : 'pulse-down';
        taskCount.classList.add(className);
        setTimeout(() => taskCount.classList.remove(className), 250);
    }

    function calculateScrollDistance(li) {
        const textElement = li.querySelector('.task-text');
        const containerElement = li.querySelector('.task-text-container');
        
        if (textElement && containerElement) {
            if (textElement.scrollWidth > containerElement.clientWidth) {
                textElement.classList.add('is-cropped');
                const distance = containerElement.clientWidth - textElement.scrollWidth;
                textElement.style.setProperty('--scroll-distance', `${distance - 6}px`);
            } else {
                textElement.classList.remove('is-cropped');
                textElement.style.removeProperty('--scroll-distance');
            }
        }
    }

    function updateActiveCountDisplay(customValue = null) {
        if (customValue !== null) {
            taskCount.textContent = customValue;
        } else {
            taskCount.textContent = taskDataArray.filter(t => !t.completed).length;
        }
    }

    function renderTasksEngine() {
        todoList.innerHTML = '';
        let displayArray = [...taskDataArray];

        if (currentSortOption === 'priority-high') {
            displayArray.sort((a, b) => priorityWeightMap[b.priority] - priorityWeightMap[a.priority]);
        } else if (currentSortOption === 'priority-low') {
            displayArray.sort((a, b) => priorityWeightMap[a.priority] - priorityWeightMap[b.priority]);
        }

        displayArray.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-priority', task.priority);
            li.setAttribute('data-id', task.id);
            if (task.completed) li.classList.add('completed');

            li.innerHTML = `
                <div class="task-content">
                    <span class="checkbox-tick">&#10003;</span>
                    <div class="task-text-container">
                        <span class="task-text">${task.text}</span>
                    </div>
                </div>
                <button class="delete-btn">&times;</button>
            `;

            li.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    task.completed = !task.completed;
                    li.classList.toggle('completed');
                    saveToLocalStorage();
                    updateActiveCountDisplay();
                    animateCounter(task.completed ? 'down' : 'up');
                }
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                
                li.classList.add('slide-out');
                
                let currentCount = parseInt(taskCount.textContent) || 0;
                if (!task.completed && currentCount > 0) {
                    currentCount--;
                    updateActiveCountDisplay(currentCount);
                    animateCounter('down');
                }

                setTimeout(() => {
                    taskDataArray = taskDataArray.filter(t => t.id !== task.id);
                    saveToLocalStorage();
                    renderTasksEngine();
                }, 440);
            });

            todoList.appendChild(li);
            calculateScrollDistance(li);
        });

        updateActiveCountDisplay();
    }

    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === '') return;

        const newTaskObj = {
            id: Date.now(),
            text: taskText,
            priority: activePriority,
            completed: false
        };

        taskDataArray.push(newTaskObj);
        saveToLocalStorage();
        renderTasksEngine();

        todoInput.value = '';
        animateCounter('up');
        
        setTimeout(() => {
            todoList.scrollTop = todoList.scrollHeight;
        }, 50);
    }

    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    deleteAllBtn.addEventListener('click', () => {
        const allItems = todoList.querySelectorAll('li');
        if (taskDataArray.length === 0 || allItems.length === 0) return;
        
        let currentCount = parseInt(taskCount.textContent) || 0;
        
        allItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('slide-out');
                const targetedId = parseInt(item.getAttribute('data-id'));
                const targetedTask = taskDataArray.find(t => t.id === targetedId);
                
                if (targetedTask && !targetedTask.completed && currentCount > 0) {
                    currentCount--;
                    updateActiveCountDisplay(currentCount);
                    animateCounter('down');
                }
            }, index * 40);
        });

        setTimeout(() => {
            const clearedIds = Array.from(allItems).map(item => parseInt(item.getAttribute('data-id')));
            taskDataArray = taskDataArray.filter(task => !clearedIds.includes(task.id));
            saveToLocalStorage();
            renderTasksEngine();
        }, (allItems.length * 40) + 440);
    });

    window.addEventListener('resize', () => {
        const items = todoList.querySelectorAll('li');
        items.forEach(item => calculateScrollDistance(item));
    });
});
