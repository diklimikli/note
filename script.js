// script.js

const canvas = document.getElementById("canvas");
const ctx = document.getElementById("connectionCanvas").getContext("2d");
const addNoteBtn = document.getElementById("addNoteBtn");
const noteModal = document.getElementById("noteModal");
const noteForm = document.getElementById("noteForm");
const closeModal = document.getElementById("closeModal");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const closeEditModal = document.getElementById("closeEditModal");
const deleteNoteBtn = document.getElementById("deleteNote");

let notes = [];
let connections = [];
let currentDraggedNote = null;
let offsetX, offsetY;

const levelColorMap = {};
const availableColors = ["#ffe0b2", "#c8e6c9", "#bbdefb", "#f8bbd0", "#d7ccc8", "#e1bee7", "#fff9c4"];
let colorIndex = 0;

function getColorForLevel(level) {
    if (!levelColorMap[level]) {
        levelColorMap[level] = availableColors[colorIndex % availableColors.length];
        colorIndex++;
    }
    return levelColorMap[level];
}

function createNoteElement(note) {
    const div = document.createElement("div");
    div.className = "note";
    div.style.left = note.x + "px";
    div.style.top = note.y + "px";
    div.style.backgroundColor = getColorForLevel(note.level);
    div.dataset.id = note.id;
    div.innerHTML = `
        <div class="note-card">
            <div class="note-title"><strong>${note.name}</strong></div>
            <div class="note-content">${note.content}</div>
        </div>`;

    div.addEventListener("mousedown", (e) => {
        currentDraggedNote = div;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    });

    div.addEventListener("dblclick", () => {
        const id = parseInt(div.dataset.id);
        const note = notes.find((n) => n.id === id);
        if (note) {
            document.getElementById("editId").value = note.id;
            document.getElementById("editName").value = note.name;
            document.getElementById("editContent").value = note.content;
            editModal.classList.remove("hidden");
        }
    });

    return div;
}

function renderNotes() {
    canvas.innerHTML = "";
    notes.forEach((note) => {
        const el = createNoteElement(note);
        canvas.appendChild(el);
    });
    drawConnections();
}

function drawConnections() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    connections.forEach(({ from, to }) => {
        const fromNote = document.querySelector(`.note[data-id='${from}']`);
        const toNote = document.querySelector(`.note[data-id='${to}']`);
        if (fromNote && toNote) {
            const fromRect = fromNote.getBoundingClientRect();
            const toRect = toNote.getBoundingClientRect();
            ctx.beginPath();
            ctx.moveTo(fromRect.left + fromRect.width / 2, fromRect.top + fromRect.height / 2);
            ctx.lineTo(toRect.left + toRect.width / 2, toRect.top + toRect.height / 2);
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

addNoteBtn.addEventListener("click", () => {
    noteModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
    noteModal.classList.add("hidden");
});

noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const content = document.getElementById("content").value;
    const level = document.getElementById("level").value || 0;
    const parent = parseInt(document.getElementById("parent").value) || null;
    const id = Date.now();
    const note = {
        id,
        name,
        content,
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 300,
        level,
        parent,
    };
    notes.push(note);
    if (parent) {
        connections.push({ from: parent, to: id });
    }
    noteModal.classList.add("hidden");
    noteForm.reset();
    renderNotes();
});

editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById("editId").value);
    const note = notes.find((n) => n.id === id);
    if (note) {
        note.name = document.getElementById("editName").value;
        note.content = document.getElementById("editContent").value;
    }
    editModal.classList.add("hidden");
    renderNotes();
});

deleteNoteBtn.addEventListener("click", () => {
    const id = parseInt(document.getElementById("editId").value);
    notes = notes.filter((n) => n.id !== id);
    connections = connections.filter((c) => c.from !== id && c.to !== id);
    editModal.classList.add("hidden");
    renderNotes();
});

closeEditModal.addEventListener("click", () => {
    editModal.classList.add("hidden");
});

document.addEventListener("mousemove", (e) => {
    if (currentDraggedNote) {
        const id = parseInt(currentDraggedNote.dataset.id);
        const note = notes.find((n) => n.id === id);
        if (note) {
            note.x = e.pageX - offsetX;
            note.y = e.pageY - offsetY;
            currentDraggedNote.style.left = note.x + "px";
            currentDraggedNote.style.top = note.y + "px";
            drawConnections();
        }
    }
});

document.addEventListener("mouseup", () => {
    currentDraggedNote = null;
});