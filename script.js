// Global State
let todo = JSON.parse(localStorage.getItem("todo")) || [];
let isDarkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

// DOM Elements
const todoBox = document.getElementById("todoBox");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const addButton = document.querySelector(".btn");
const deleteButton = document.getElementById("deleteButton");

const prioritySlider = document.getElementById("prioritySlider");
const priorityLabel = document.getElementById("priorityLabel");

// Settings, Drag & Modal Elements
const dragHandle = document.getElementById("dragHandle");
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");
const darkModeToggle = document.getElementById("darkModeToggle");
const sortSelect = document.getElementById("sortSelect");

const confirmModal = document.getElementById("confirmModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Data Migration Format Enforcer
todo = todo.map(item => {
  let p = item.priority;
  if (p === "low") p = 1;
  else if (p === "medium") p = 2;
  else if (p === "high") p = 3;
  else if (!p) p = 1;
  
  return { ...item, priority: p, createdAt: item.createdAt || Date.now() };
});

// Initialize listeners
document.addEventListener("DOMContentLoaded", function () {
  addButton.addEventListener("click", addTask);
  
  // Enter key support
  todoInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      addTask();
    }
  });
  
  // Live Search / Filter logic attached to input
  todoInput.addEventListener("input", filterTasks);

  // Modal Triggers
  deleteButton.addEventListener("click", showDeleteModal);
  cancelDeleteBtn.addEventListener("click", hideDeleteModal);
  confirmDeleteBtn.addEventListener("click", executeDeleteAll);
  
  // Settings Listeners
  settingsBtn.addEventListener("click", () => settingsMenu.classList.toggle("hidden"));
  darkModeToggle.addEventListener("change", toggleDarkMode);
  
  sortSelect.value = localStorage.getItem("sortPref") || "date";
  sortSelect.addEventListener("change", () => {
    localStorage.setItem("sortPref", sortSelect.value);
    displayTasks();
    filterTasks(); // Re-apply search if sorting while searching
  });
  
  prioritySlider.addEventListener("input", updatePriorityLabel);
  
  applyTheme();
  displayTasks();
  dragElement(todoBox, dragHandle);
});

// --- Modal & Delete Logic ---
function showDeleteModal() {
  if (todo.length === 0) return;
  confirmModal.classList.remove("hidden");
}

function hideDeleteModal() {
  confirmModal.classList.add("hidden");
}

function executeDeleteAll() {
  hideDeleteModal();
  
  const items = document.querySelectorAll(".todo-item");
  let currentCount = todo.length;

  items.forEach((item, index) => {
    // Only animate items that aren't already hidden by the search filter
    if (item.style.display !== "none") {
      setTimeout(() => {
        item.classList.add("deleting");
        currentCount--;
        updateCounterDisplay(currentCount);

        if (index === items.length - 1) {
          setTimeout(() => {
            todo = [];
            saveToLocalStorage();
            displayTasks();
          }, 450); 
        }
      }, index * 70); 
    } else {
      // If heavily filtered, force clear immediately at end
      if (index === items.length - 1) {
        todo = [];
        saveToLocalStorage();
        displayTasks();
      }
    }
  });
}

// --- Search Filter Logic ---
function filterTasks() {
  const searchTerm = todoInput.value.toLowerCase().trim();
  const items = document.querySelectorAll(".todo-item");
  
  items.forEach((item, index) => {
    const text = todo[index].text.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// --- Settings & Theme Logic ---
function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    darkModeToggle.checked = false;
  }
}

function toggleDarkMode() {
  isDarkMode = darkModeToggle.checked;
  localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  applyTheme();
}

function updatePriorityLabel() {
  const val = parseInt(prioritySlider.value);
  priorityLabel.className = "priority-label"; 
  if (val === 1) {
    priorityLabel.textContent = "Low";
    priorityLabel.classList.add("prio-1-text");
  } else if (val === 2) {
    priorityLabel.textContent = "Medium";
    priorityLabel.classList.add("prio-2-text");
  } else {
    priorityLabel.textContent = "High";
    priorityLabel.classList.add("prio-3-text");
  }
}

document.addEventListener('click', (event) => {
  if (!settingsMenu.contains(event.target) && !settingsBtn.contains(event.target)) {
    settingsMenu.classList.add('hidden');
  }
});

// --- Drag & Drop Logic ---
function dragElement(elmnt, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if(e.target.closest('#settingsBtn') || e.target.closest('.settings-menu')) return;
    
    e.preventDefault();
    pos3 = e.clientX; pos4 = e.clientY;
    
    if (elmnt.style.transform !== "none") {
      const rect = elmnt.getBoundingClientRect();
      elmnt.style.transform = "none";
      elmnt.style.left = rect.left + "px";
      elmnt.style.top = rect.top + "px";
    }
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
    pos3 = e.clientX; pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null; document.onmousemove = null;
  }
}

// --- Sorting Engine ---
function sortTasksArray() {
  const pref = sortSelect.value;
  if (pref === "highToLow") {
    todo.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
  } else if (pref === "lowToHigh") {
    todo.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
  } else {
    todo.sort((a, b) => a.createdAt - b.createdAt);
  }
}

// --- Todo Logic ---
function addTask() {
  const newTask = todoInput.value.trim();
  const priorityVal = parseInt(prioritySlider.value); 
  
  if (newTask !== "") {
    // If they were searching, adding effectively adds the term and clears the search
    todo.push({ 
      text: newTask, disabled: false, priority: priorityVal, createdAt: Date.now() 
    });
    saveToLocalStorage();
    
    todoInput.value = "";
    prioritySlider.value = 1;
    updatePriorityLabel();
    
    displayTasks();
  }
}

function displayTasks() {
  sortTasksArray();
  todoList.innerHTML = "";
  
  todo.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    li.id = `item-${index}`; 
    const dotClass = `prio-${item.priority}`;
    
    li.innerHTML = `
      <div class="todo-container">
        <input type="checkbox" class="todo-checkbox" id="input-${index}" ${item.disabled ? "checked" : ""}>
        <div class="priority-dot ${dotClass}" title="Priority Level"></div>
        <p id="todo-${index}" class="${item.disabled ? "disabled" : ""}" title="Click text to edit">${item.text}</p>
        <button class="delete-item-btn" id="delete-btn-${index}" title="Delete task">&times;</button>
      </div>
    `;
    
    li.querySelector(".todo-checkbox").addEventListener("change", () => toggleTask(index));
    li.querySelector(`#todo-${index}`).addEventListener("click", () => editTask(index));
    li.querySelector(`#delete-btn-${index}`).addEventListener("click", () => deleteSingleTask(index));
    
    todoList.appendChild(li);
  });
  
  updateTaskCounter();
}

function updateTaskCounter() {
  updateCounterDisplay(todo.length);
}

function updateCounterDisplay(count) {
  const counterContainer = document.querySelector(".counter-container p");
  if (counterContainer) {
    if (count === 0) {
      counterContainer.innerHTML = `<span class="all-caught-up">🎉 All caught up!</span>`;
    } else {
      counterContainer.innerHTML = `<span id="todoCount">${count}</span> ${count === 1 ? "task" : "tasks"} total`;
    }
  }
}

function editTask(index) {
  const todoItem = document.getElementById(`todo-${index}`);
  if (!todoItem || todo[index].disabled) return;

  const existingText = todo[index].text;
  const inputElement = document.createElement("input");
  inputElement.type = "text";
  inputElement.className = "edit-input";
  inputElement.value = existingText;

  todoItem.replaceWith(inputElement);
  inputElement.focus();

  let hasSaved = false;

  const saveChanges = () => {
    if (hasSaved) return;
    hasSaved = true;
    const updatedText = inputElement.value.trim();
    if (updatedText) {
      todo[index].text = updatedText;
      saveToLocalStorage();
    }
    displayTasks();
    filterTasks(); // Reapply search if active
  };

  inputElement.addEventListener("blur", saveChanges);
  inputElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); saveChanges();
    } else if (event.key === "Escape") {
      event.preventDefault(); hasSaved = true; 
      displayTasks(); filterTasks();
    }
  });
}

function toggleTask(index) {
  todo[index].disabled = !todo[index].disabled;
  saveToLocalStorage();
  displayTasks();
  filterTasks();
}

function deleteSingleTask(index) {
  const itemElement = document.getElementById(`item-${index}`);
  itemElement.classList.add("deleting");
  
  setTimeout(() => {
    todo.splice(index, 1);
    saveToLocalStorage();
    displayTasks();
    filterTasks();
  }, 450); 
}

function saveToLocalStorage() {
  localStorage.setItem("todo", JSON.stringify(todo));
}

