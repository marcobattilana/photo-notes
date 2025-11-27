let stream = null;
const video = document.getElementById("cameraView");
const startBtn = document.getElementById("startCameraBtn");
const captureBtn = document.getElementById("captureBtn");
const preview = document.getElementById("preview");
const descInput = document.getElementById("description");
const saveBtn = document.getElementById("saveBtn");
const galleryDiv = document.getElementById("gallery");

let lastPhotoDataUrl = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });
    video.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert("Impossibile avviare la fotocamera: " + err.message);
  }
}

function capturePhoto() {
  if (!stream) {
    alert("Avvia prima la fotocamera.");
    return;
  }
  const trackSettings = stream.getVideoTracks()[0].getSettings();
  const width = trackSettings.width || 640;
  const height = trackSettings.height || 480;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);
  lastPhotoDataUrl = canvas.toDataURL("image/jpeg", 0.9);
  preview.src = lastPhotoDataUrl;
  preview.style.display = "block";
}

function saveNote() {
  if (!lastPhotoDataUrl) {
    alert("Scatta una foto prima di salvare!");
    return;
  }
  const desc = descInput.value.trim();
  const item = {
    id: Date.now(),
    img: lastPhotoDataUrl,
    desc,
    date: new Date().toLocaleString()
  };
  const notes = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  notes.push(item);
  localStorage.setItem("photoNotesCam", JSON.stringify(notes));
  descInput.value = "";
  lastPhotoDataUrl = null;
  preview.style.display = "none";
  preview.src = "";
  loadGallery();
}

function loadGallery() {
  const notes = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  galleryDiv.innerHTML = "";
  notes.forEach(note => {
    const div = document.createElement("div");
    div.className = "photoCard";
    div.innerHTML = `
      <img src="${note.img}">
      <p>${note.desc || "(senza descrizione)"}<br><span class="small">${note.date}</span></p>
      <button class="downloadBtn" onclick="downloadNote(${note.id})">⬇️ Scarica</button>
      <button class="deleteBtn" onclick="deleteNote(${note.id})">🗑 Elimina</button>
    `;
    galleryDiv.appendChild(div);
  });
}

function deleteNote(id) {
  let notes = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("photoNotesCam", JSON.stringify(notes));
  loadGallery();
}

function downloadNote(id) {
  const notes = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  const item = notes.find(n => n.id === id);
  const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `note-${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

startBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capturePhoto);
saveBtn.addEventListener("click", saveNote);
loadGallery();
