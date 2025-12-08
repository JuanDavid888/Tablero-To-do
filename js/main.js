/* ==========================================================
   Tablero To-Do
   Funcionalidades:
   - Crear tareas
   - Editar
   - Arrastrar entre columnas
   - Guardar en localStorage
   - Buscador
=========================================================== */

let tasks = [];

/* -----------------------------------------
   Inicialización
------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    renderAllTasks();
    setupEventListeners();
});

/* -----------------------------------------
   Configurar eventos principales
------------------------------------------ */
function setupEventListeners() {
    document.getElementById("btnOpenModal").addEventListener("click", openCreateModal);
    document.getElementById("cancelModalBtn").addEventListener("click", closeModal);
    document.getElementById("taskForm").addEventListener("submit", saveTask);

    document.getElementById("searchInput").addEventListener("input", filterTasks);

    setupDragAndDrop();
}

/* -----------------------------------------
   Modal
------------------------------------------ */
function openCreateModal() {
    document.getElementById("modalTitle").textContent = "Nueva tarea";
    document.getElementById("taskForm").reset();
    document.getElementById("taskId").value = "";

    document.getElementById("taskModal").classList.remove("hidden");
}

function openEditModal(task) {
    document.getElementById("modalTitle").textContent = "Editar tarea";

    document.getElementById("taskId").value = task.id;
    document.getElementById("taskName").value = task.name;
    document.getElementById("taskDescription").value = task.description;
    document.getElementById("taskHours").value = task.hours || "";
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskResponsibles").value = task.responsibles || "";

    document.getElementById("taskModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("taskModal").classList.add("hidden");
}

/* -----------------------------------------
   Guardar / Editar Tarea
------------------------------------------ */
function saveTask(e) {
    e.preventDefault();

    const id = document.getElementById("taskId").value;

    const taskData = {
        id: id ? id : Date.now().toString(),
        name: document.getElementById("taskName").value,
        description: document.getElementById("taskDescription").value,
        hours: document.getElementById("taskHours").value,
        priority: document.getElementById("taskPriority").value,
        responsibles: document.getElementById("taskResponsibles").value,
        status: id ? getTaskById(id).status : "hacer"
    };

    if (id) {
        // edición
        const index = tasks.findIndex(t => t.id === id);
        tasks[index] = taskData;
    } else {
        // creación
        tasks.push(taskData);
    }

    saveToLocalStorage();
    renderAllTasks();
    closeModal();
}

/* -----------------------------------------
   Renderizado
------------------------------------------ */
function renderAllTasks() {
    document.getElementById("hacer").innerHTML = "";
    document.getElementById("haciendo").innerHTML = "";
    document.getElementById("hecho").innerHTML = "";

    tasks.forEach(renderTask);
}

function renderTask(task) {
    const container = document.getElementById(task.status);

    const div = document.createElement("div");
    div.className = "task";
    div.draggable = true;
    div.dataset.id = task.id;

    div.innerHTML = `
        <div class="task-title">${task.name}</div>
        <br />
        <div class="task-priority"><strong>Descripción:</strong> ${task.description}</div>
        <div class="task-priority"><strong>Prioridad:</strong> ${task.priority}</div>
        <div class="task-actions">
            <button onclick="editTask('${task.id}')">Editar</button>
            <button onclick="deleteTask('${task.id}')">Eliminar</button>
        </div>
    `;

    addDragEvents(div);

    container.appendChild(div);
}

/* -----------------------------------------
   Búsqueda
------------------------------------------ */
function filterTasks(e) {
    const text = e.target.value.toLowerCase();

    tasks.forEach(t => {
        const el = document.querySelector(`[data-id="${t.id}"]`);
        if (!el) return;

        el.style.display = t.name.toLowerCase().includes(text) ? "block" : "none";
    });
}

/* -----------------------------------------
   CRUD: Editar / Eliminar
------------------------------------------ */
function editTask(id) {
    const task = getTaskById(id);
    openEditModal(task);
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToLocalStorage();
    renderAllTasks();
}

/* -----------------------------------------
   Drag & Drop
------------------------------------------ */
function setupDragAndDrop() {
    const columns = document.querySelectorAll(".task-list");

    columns.forEach(col => {
        col.addEventListener("dragover", e => {
            e.preventDefault();
        });

        col.addEventListener("drop", e => {
            const id = e.dataTransfer.getData("id");
            const task = getTaskById(id);
            task.status = col.id;

            saveToLocalStorage();
            renderAllTasks();
        });
    });
}

function addDragEvents(element) {
    element.addEventListener("dragstart", e => {
        e.dataTransfer.setData("id", element.dataset.id);
        element.classList.add("dragging");
    });

    element.addEventListener("dragend", e => {
        element.classList.remove("dragging");
    });
}

/* -----------------------------------------
   Utils
------------------------------------------ */
function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadFromLocalStorage() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
}

function getTaskById(id) {
    return tasks.find(t => t.id === id);
}
