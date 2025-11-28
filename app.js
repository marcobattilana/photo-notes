// -------------------------------------------
// PHOTO NOTES - APP.JS (con pulsante ELIMINA TUTTO)
// -------------------------------------------

// Carica galleria al caricamento pagina
document.addEventListener("DOMContentLoaded", loadGallery);

// Elementi
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let stream = null;
let lastPhotoData = null;

// Avvia fotocamera
document.getElementById("startCamera").addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
    } catch (err) {
        alert("Errore nell’avviare la fotocamera");
        console.error(err);
    }
});

// Scatta foto
document.getElementById("takePhoto").addEventListener("click", () => {
    if (!stream) {
        alert("Avvia prima la fotocamera");
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    lastPhotoData = canvas.toDataURL("image/jpeg");
    document.getElementById("preview").src = lastPhotoData;
});

// Salva foto + descrizione
document.getElementById("savePhoto").addEventListener("click", () => {
    const descr = document.getElementById("description").value.trim();
    if (!lastPhotoData) {
        alert("Scatta prima una foto!");
        return;
    }
    if (!descr) {
        alert("Scrivi una descrizione!");
        return;
    }

    const id = "photo_" + Date.now();
    const date = new Date().toLocaleString();

    const item = {
        id: id,
        img: lastPhotoData,
        descr: descr,
        date: date
    };

    let gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    gallery.push(item);
    localStorage.setItem("gallery", JSON.stringify(gallery));

    // pulizia UI
    document.getElementById("description").value = "";
    document.getElementById("preview").src = "";
    lastPhotoData = null;

    loadGallery();
    alert("Foto salvata!");
});

// Carica e mostra galleria
function loadGallery() {
    const gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    const container = document.getElementById("gallery");

    container.innerHTML = "";

    gallery.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.img}" class="thumb">
            <div class="title">${item.descr}</div>
            <div class="date">${item.date}</div>
            <button class="download" onclick="downloadPhoto('${item.id}')">⬇️ Scarica</button>
            <button class="delete" onclick="deletePhoto('${item.id}')">🗑️ Elimina</button>
        `;
        container.appendChild(card);
    });
}

// Elimina singola foto
function deletePhoto(id) {
    let gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    gallery = gallery.filter(item => item.id !== id);
    localStorage.setItem("gallery", JSON.stringify(gallery));
    loadGallery();
}

// Download singola foto
function downloadPhoto(id) {
    const gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    const item = gallery.find(el => el.id === id);

    if (!item) return;

    const a = document.createElement("a");
    a.href = item.img;
    a.download = item.descr.replace(/[^a-z0-9]/gi, "_") + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 🔥 Elimina tutta la galleria
document.getElementById("deleteAllBtn").addEventListener("click", () => {
    if (confirm("Vuoi davvero eliminare TUTTE le foto e le descrizioni?")) {
        localStorage.removeItem("photoNotesCam");
        loadGallery();
        alert("Galleria svuotata!");
    }
});
