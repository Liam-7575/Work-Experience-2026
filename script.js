document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const taskCount = document.getElementById('task-count');

    function updateCounter() {
        const totalItems = todoList.children.filter ? 
            Array.from(todoList.children).filter(item => !item.classList.contains('slide-out')).length : 
            todoList.children.length;
            
        taskCount.textContent = totalItems;
        taskCount.classList.add('pulse');
        setTimeout(() => {
            taskCount.classList.remove('pulse');
        }, 150);
    }

    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText === '') return;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="task-content">
                <span class="checkbox-tick">&#10003;</span>
                <span class="task-text">${taskText}</span>
            </div>
            <button class="delete-btn">&times;</button>
        `;

        li.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                li.classList.toggle('completed');
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            li.classList.add('slide-out');
            setTimeout(() => {
                li.remove();
                updateCounter();
            }, 300);
        });

        todoList.appendChild(li);
        todoInput.value = '';
        updateCounter();
        todoList.scrollTop = todoList.scrollHeight;
    }

    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    deleteAllBtn.addEventListener('click', () => {
        const items = todoList.querySelectorAll('li');
        let currentCount = items.length;
        if (currentCount === 0) return;
        
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('slide-out');
                
                currentCount--;
                taskCount.textContent = currentCount;
                taskCount.classList.add('pulse');
                setTimeout(() => {
                    taskCount.classList.remove('pulse');
                }, 100);
                
            }, index * 80);
        });

        setTimeout(() => {
            todoList.innerHTML = '';
        }, (items.length * 80) + 300);
    });
});
