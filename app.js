// PHOTO NOTES — app.js corretto

document.addEventListener("DOMContentLoaded", loadGallery);

const video = document.getElementById("cameraView");
const preview = document.getElementById("preview");
const descInput = document.getElementById("description");

let stream = null;
let lastPhoto = null;

document.getElementById("startCameraBtn").addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();
    document.getElementById("captureBtn").disabled = false;
  } catch (err) {
    alert("Errore fotocamera: " + err);
  }
});

document.getElementById("captureBtn").addEventListener("click", () => {
  if (!stream) {
    alert("Avvia prima la fotocamera");
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);
  lastPhoto = canvas.toDataURL("image/jpeg");
  preview.src = lastPhoto;
});

document.getElementById("saveBtn").addEventListener("click", () => {
  if (!lastPhoto) {
    alert("Scatta prima una foto!");
    return;
  }
  const descr = descInput.value.trim();
  const id = "photo_" + Date.now();
  const date = new Date().toLocaleString();

  const item = { id, img: lastPhoto, descr, date };

  const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  arr.push(item);
  localStorage.setItem("photoNotesCam", JSON.stringify(arr));

  descInput.value = "";
  preview.src = "";
  lastPhoto = null;

  loadGallery();
});

function loadGallery() {
  const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";
  arr.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${item.img}" class="thumb">
      <div class="title">${item.descr}</div>
      <div class="date">${item.date}</div>
      <button onclick="downloadPhoto('${item.id}')">⬇️ Scarica</button>
      <button onclick="deletePhoto('${item.id}')">🗑️ Elimina</button>
    `;
    gallery.appendChild(div);
  });
}

function deletePhoto(id) {
  let arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  arr = arr.filter(i => i.id !== id);
  localStorage.setItem("photoNotesCam", JSON.stringify(arr));
  loadGallery();
}

function downloadPhoto(id) {
  const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  const item = arr.find(i => i.id === id);
  if (!item) return;
  const a = document.createElement("a");
  a.href = item.img;
  a.download = item.descr.replace(/[^a-z0-9]/gi, "_") + ".jpg";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Esporta ZIP con JSZip
document.getElementById("exportZipBtn").addEventListener("click", async () => {
  const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
  if (!arr.length) {
    alert("Nessuna foto da esportare.");
    return;
  }
  const zip = new JSZip();
  const folder = zip.folder("PhotoNotes");

  arr.forEach(item => {
    const data = item.img.split(",")[1];
    folder.file(`${item.id}.jpg`, data, { base64: true });
    folder.file(`${item.id}.txt`, `Descrizione: ${item.descr}\nData: ${item.date}`);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "galleria_photonotes.zip";
  a.click();
  URL.revokeObjectURL(a.href);
});

// Elimina TUTTA la galleria
document.getElementById("deleteAllBtn").addEventListener("click", () => {
  if (confirm("Elimina tutte le foto e descrizioni?")) {
    localStorage.removeItem("photoNotesCam");
    loadGallery();
    alert("Galleria svuotata!");
  }
});
