// Elemszelektorok
const canvas = document.getElementById("canvas");
const ctx = document.getElementById("connectionCanvas").getContext("2d");
const addNoteBtn = document.getElementById("addNoteBtn");
const noteModal = document.getElementById("noteModal");
const noteForm = document.getElementById("noteForm");
const closeModal = document.getElementById("closeModal");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const closeEditModal = document.getElementById("closeEditModal");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const clearContentBtn = document.getElementById("clearContentBtn");

// Adatok
let notes = [];
let connections = [];
let currentDraggedNote = null;
let offsetX, offsetY;

const availableColors = [
  "#ffe0b2", "#c8e6c9", "#bbdefb", "#f8bbd0", "#d7ccc8", "#e1bee7", "#fff9c4",
  "#ff007f", "#00ffe7", "#8aff00", "#ff00ff", "#ff6ec7", "#00ffff", "#ffcc00",
  "#7f00ff", "#00ff90", "#ff3cac", "#2eecff", "#f72585", "#7209b7",
  "#ff8a65", "#ce93d8", "#81d4fa", "#a5d6a7", "#ffd54f", "#ffb74d", "#64ffda",
  "#ba68c8", "#ff5252", "#c6ff00", "#40c4ff", "#d500f9", "#ff4081", "#69f0ae", "#fbc02d", "#ff1744"
];
const categories = ["munka", "saját", "projekt", "prod01", "prod02", "prod04", "prod05"];
const levelColorMap = {};

// Kategória legördülő feltöltése
const levelInput = document.getElementById("level");
levelInput.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

// Szín hozzárendelés kategóriákhoz
function getColorByLevel(level) {
  if (!levelColorMap[level]) {
    levelColorMap[level] = availableColors[Math.floor(Math.random() * availableColors.length)];
  }
  return levelColorMap[level];
}

// Jegyzet DOM elem létrehozása
function createNoteElement(note) {
  const div = document.createElement("div");
  div.className = "note";
  div.style.left = note.x + "px";
  div.style.top = note.y + "px";
  div.style.backgroundColor = getColorByLevel(note.level);
  div.dataset.id = note.id;

  div.innerHTML = `
    <div class="note-card">
      <div class="note-level-indicator" title="${note.level}" style="background-color: ${getColorByLevel(note.level)}"></div>
      <div class="note-title"><strong>${note.name}</strong></div>
      <div class="note-content">${note.content}</div>
    </div>`;

  // Kattintás a szerkesztés megnyitásához
  div.addEventListener("click", () => {
    const id = parseInt(div.dataset.id);
    const note = notes.find((n) => n.id === id);
    if (note) {
      document.getElementById("editId").value = note.id;
      document.getElementById("editName").value = note.name;
      document.getElementById("editContent").value = note.content;
      editModal.classList.remove("hidden");
    }
  });

  // Egér drag indítása
  div.addEventListener("mousedown", (e) => {
    currentDraggedNote = div;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  return div;
}

// Tartalom törlés gomb
clearContentBtn.addEventListener("click", () => {
  document.getElementById("content").value = "";
});

// Jegyzetek újrarajzolása
function renderNotes() {
  canvas.innerHTML = "";
  notes.forEach((note) => {
    const el = createNoteElement(note);
    canvas.appendChild(el);
  });
  drawConnections();
  updateLevelDisplay();
}

// Kategória színek megjelenítése
function updateLevelDisplay() {
  const levelDisplay = document.getElementById("levelDisplay");
  const uniqueLevels = [...new Set(notes.map(n => n.level))];
  levelDisplay.innerHTML = "<strong>categories:</strong><br>";
  uniqueLevels.forEach(level => {
    const color = getColorByLevel(level);
    levelDisplay.innerHTML += `
      <div class="level-tag">
        <div class="level-color" style="background-color: ${color};"></div>
        <span>${level}</span>
      </div>`;
  });
}

// Jegyzet kapcsolatok kirajzolása
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

// Gomb események
addNoteBtn.addEventListener("click", () => noteModal.classList.remove("hidden"));
closeModal.addEventListener("click", () => noteModal.classList.add("hidden"));
closeEditModal.addEventListener("click", () => editModal.classList.add("hidden"));

// Új jegyzet létrehozás
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const content = document.getElementById("content").value;
  const level = document.getElementById("level").value;
  const id = Date.now();
  const note = { id, name, content, x: 100 + Math.random() * 300, y: 100 + Math.random() * 300, level };
  notes.push(note);
  noteModal.classList.add("hidden");
  noteForm.reset();
  renderNotes();
});

// Jegyzet szerkesztése
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

// Jegyzet törlése
deleteNoteBtn.addEventListener("click", () => {
  const id = parseInt(document.getElementById("editId").value);
  notes = notes.filter((n) => n.id !== id);
  connections = connections.filter((c) => c.from !== id && c.to !== id);
  editModal.classList.add("hidden");
  renderNotes();
});

// Drag mozgatás egérrel
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

// Drag mozgatás mobilon (touch)
document.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.closest(".note")) {
    currentDraggedNote = target.closest(".note");
    offsetX = touch.clientX - currentDraggedNote.offsetLeft;
    offsetY = touch.clientY - currentDraggedNote.offsetTop;
  }
});

document.addEventListener("touchmove", (e) => {
  if (currentDraggedNote) {
    e.preventDefault(); // Ne scrollozzon közben
    const touch = e.touches[0];
    const id = parseInt(currentDraggedNote.dataset.id);
    const note = notes.find((n) => n.id === id);
    if (note) {
      note.x = touch.pageX - offsetX;
      note.y = touch.pageY - offsetY;
      currentDraggedNote.style.left = note.x + "px";
      currentDraggedNote.style.top = note.y + "px";
      drawConnections();
    }
  }
}, { passive: false });

document.addEventListener("mouseup", () => {
  currentDraggedNote = null;
});
document.addEventListener("touchend", () => {
  currentDraggedNote = null;
});

let editMode = false;

// Gomb események
document.getElementById('editNoteButton').addEventListener('click', function() {
    editMode = !editMode;
    this.textContent = editMode ? '✅ Kilépés szerkesztésből' : '✏️ Szerkesztő mód';
});

// Jegyzetek szerkesztése, ha szerkesztő mód aktív
canvas.addEventListener('click', function(e) {
  const note = e.target.closest('.note');
  if (note && editMode) {
    const id = parseInt(note.dataset.id);
    const noteData = notes.find((n) => n.id === id);
    if (noteData) {
      document.getElementById("editId").value = noteData.id;
      document.getElementById("editName").value = noteData.name;
      document.getElementById("editContent").value = noteData.content;
      editModal.classList.remove("hidden");
    }
  }
});
