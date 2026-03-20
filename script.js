// ✅ Initialize mobile drag-and-drop polyfill for touch devices
MobileDragDrop.polyfill({ holdToDrag: 100 });
// Necessary for iOS Safari to allow polyfill 
window.addEventListener('touchmove', function () { }, { passive: false });

const todoList = document.querySelector("#todo");
const progressList = document.querySelector("#progress");
const doneList = document.querySelector("#done");

let draggedTaskId = null;

// 🧠 Main data (array)
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Migrate OLD tasks without createdAt
tasks = tasks.map(task => {
    if (!task.createdAt) {
        task.createdAt = new Date().toISOString();
    }
    return task;
});

// ✅ Save to localStorage
function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ✅ Update counts
function updateCounts() {
    document.getElementById('todo-count').innerText = tasks.filter(t => t.status === 'todo').length;
    document.getElementById('progress-count').innerText = tasks.filter(t => t.status === 'progress').length;
    document.getElementById('done-count').innerText = tasks.filter(t => t.status === 'done').length;
}

// FORMAT DATE
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    }).replace(',', '');
}

// ✅ Render tasks
function renderTasks() {
    // Clear all lists
    todoList.innerHTML = '';
    progressList.innerHTML = '';
    doneList.innerHTML = '';

    tasks.forEach((task) => {
        const div = document.createElement("div");
        div.classList.add("task");
        div.draggable = true;
        div.dataset.id = task.id;

        const timeString = task.createdAt ? formatDate(task.createdAt) : '';

        div.innerHTML = `
            <h3>${task.title}</h3>
            ${timeString ? `<span class="time">${timeString}</span>` : ''}
            <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        `;

        // Drag start
        div.addEventListener("dragstart", (e) => {
            draggedTaskId = task.id;
            // set slightly opacity when dragging
            setTimeout(() => div.style.opacity = '0.5', 0);
        });

        div.addEventListener("dragend", () => {
            div.style.opacity = '1';
        });

        // Delete
        div.querySelector(".delete-btn").addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveData();
            renderTasks();
        });

        // Append based on status
        if (task.status === "todo") {
            todoList.appendChild(div);
        } else if (task.status === "progress") {
            progressList.appendChild(div);
        } else {
            doneList.appendChild(div);
        }
    });

    updateCounts();
}

// ✅ Drag & Drop setup
function setupColumn(column, status) {
    // We attach the listeners to the parent column to make the whole area droppable
    const colContainer = column.parentElement;

    colContainer.addEventListener("dragenter", (e) => {
        e.preventDefault();
        colContainer.classList.add("hover-over");
    });

    colContainer.addEventListener("dragleave", (e) => {
        e.preventDefault();
        // Only remove if not dragging into a child
        if (!colContainer.contains(e.relatedTarget)) {
            colContainer.classList.remove("hover-over");
        }
    });

    colContainer.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    colContainer.addEventListener("drop", (e) => {
        e.preventDefault();
        colContainer.classList.remove("hover-over");

        if (draggedTaskId) {
            tasks = tasks.map(task => {
                if (task.id === draggedTaskId) {
                    return { ...task, status };
                }
                return task;
            });

            saveData();
            renderTasks();
            draggedTaskId = null;
        }
    });
}

setupColumn(todoList, "todo");
setupColumn(progressList, "progress");
setupColumn(doneList, "done");

// ✅ Add task logic for all columns
document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const status = e.target.dataset.status;
        const input = document.getElementById(`${status}-input`);
        const title = input.value;

        if (!title.trim()) return;

        const newTask = {
            id: Date.now().toString(),
            title,
            createdAt: new Date().toISOString(),
            status
        };

        tasks.push(newTask);
        input.value = '';

        saveData();
        renderTasks();
    });
});

// Allow entering with Enter key
document.querySelectorAll('.add-task-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const status = input.id.split('-')[0]; // todo-input -> todo
            const btn = document.querySelector(`.add-task-btn[data-status="${status}"]`);
            if (btn) btn.click();
        }
    });
});

// ✅ Initial render
renderTasks();