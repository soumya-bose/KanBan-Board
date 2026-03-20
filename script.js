const todo = document.querySelector("#todo");
const progress = document.querySelector("#in-progress");
const done = document.querySelector("#done");

let draggedTaskId = null;

// 🧠 Main data (array)
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const addTaskButton = document.querySelector("#add-new-task");
const toggleModalButton = document.querySelector("#toggle-modal");
const modal = document.querySelector(".modal");
const closeModalButton = document.querySelector(".fa-xmark");

// ✅ Save to localStorage
function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ✅ Update counts
function updateCounts() {
    [todo, progress, done].forEach((col) => {
        const count = col.querySelector(".right");
        const taskCount = col.querySelectorAll(".task").length;
        if (count) count.innerText = taskCount;
    });
}

// ✅ Render tasks (HEADER SAFE)
function renderTasks() {
    // ❗ Only remove old tasks, NOT header
    document.querySelectorAll(".task").forEach(el => el.remove());

    tasks.forEach((task) => {
        const div = document.createElement("div");
        div.classList.add("task");
        div.draggable = true;
        div.dataset.id = task.id;

        div.innerHTML = `
            <h2>${task.title}</h2>
            <p>${task.desc}</p>
            <button class="delete-btn">Delete</button>
        `;

        // Drag start
        div.addEventListener("dragstart", () => {
            draggedTaskId = task.id;
        });

        // Delete
        div.querySelector(".delete-btn").addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveData();
            renderTasks();
        });

        // Append based on status
        if (task.status === "todo") {
            todo.appendChild(div);
        } else if (task.status === "progress") {
            progress.appendChild(div);
        } else {
            done.appendChild(div);
        }
    });

    updateCounts();
}

// ✅ Drag & Drop setup
function setupColumn(column, status) {
    column.addEventListener("dragenter", function (e) {
        e.preventDefault();
        this.classList.add("hover-over");
    });

    column.addEventListener("dragleave", function (e) {
        e.preventDefault();
        this.classList.remove("hover-over");
    });

    column.addEventListener("dragover", (e) => e.preventDefault());

    column.addEventListener("drop", function () {
        this.classList.remove("hover-over");

        tasks = tasks.map(task => {
            if (task.id === draggedTaskId) {
                return { ...task, status };
            }
            return task;
        });

        saveData();
        renderTasks();
    });
}

setupColumn(todo, "todo");
setupColumn(progress, "progress");
setupColumn(done, "done");

// ✅ Add task
addTaskButton.addEventListener("click", (e) => {
    e.preventDefault();

    const title = document.querySelector("#task-title-input").value;
    const desc = document.querySelector("#task-description-input").value;

    if (!title.trim()) return;

    const newTask = {
        id: Date.now(),
        title,
        desc,
        status: "todo"
    };

    tasks.push(newTask);

    saveData();
    renderTasks();

    modal.classList.remove("active");

    document.querySelector("#task-title-input").value = "";
    document.querySelector("#task-description-input").value = "";
});

// ✅ Modal controls
toggleModalButton.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.toggle("active");
});

closeModalButton.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("active");
});

// ✅ Initial render
renderTasks();