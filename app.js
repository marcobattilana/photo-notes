// -------------------------------------------
// PHOTO NOTES - APP.JS (compatibile con index.html reale)
// -------------------------------------------

document.addEventListener("DOMContentLoaded", loadGallery);

// ELEMENTI
const video = document.getElementById("cameraView");
const preview = document.getElementById("preview");
const description = document.getElementById("description");

let stream = null;
let lastPhotoData = null;

// AVVIA FOTOCAMERA
document.getElementById("startCameraBtn").addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();

        document.getElementById("captureBtn").disabled = false;
    } catch (error) {
        alert("Errore nell’avvio della fotocamera");
        console.error(error);
    }
});

// SCATTA FOTO
document.getElementById("captureBtn").addEventListener("click", () => {
    if (!stream) {
        alert("Avvia prima la fotocamera!");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    lastPhotoData = canvas.toDataURL("image/jpeg");
    preview.src = lastPhotoData;
});

// SALVA FOTO
document.getElementById("saveBtn").addEventListener("click", () => {
    if (!lastPhotoData) {
        alert("Scatta prima una foto!");
        return;
    }

    const text = description.value.trim();
    if (!text) {
        alert("Scrivi una descrizione!");
        return;
    }

    const entry = {
        id: "photo_" + Date.now(),
        img: lastPhotoData,
        descr: text,
        date: new Date().toLocaleString()
    };

    const gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    gallery.push(entry);
    localStorage.setItem("gallery", JSON.stringify(gallery));

    description.value = "";
    preview.src = "";
    lastPhotoData = null;

    loadGallery();
    alert("Foto salvata!");
});

// CARICA GALLERIA
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
            <button onclick="downloadPhoto('${item.id}')">⬇️ Scarica</button>
            <button onclick="deletePhoto('${item.id}')">🗑️ Elimina</button>
        `;
        container.appendChild(card);
    });
}

// ELIMINA SINGOLA FOTO
function deletePhoto(id) {
    let gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    gallery = gallery.filter(item => item.id !== id);
    localStorage.setItem("gallery", JSON.stringify(gallery));
    loadGallery();
}

// SCARICA FOTO
function downloadPhoto(id) {
    const gallery = JSON.parse(localStorage.getItem("gallery") || "[]");
    const item = gallery.find(e => e.id === id);
    if (!item) return;

    const a = document.createElement("a");
    a.href = item.img;
    a.download = item.descr.replace(/[^a-z0-9]/gi, "_") + ".jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// -------------------------------------------
// 🔥 ELIMINA TUTTA LA GALLERIA
// -------------------------------------------

document.getElementById("deleteAllBtn").addEventListener("click", () => {
    if (confirm("Vuoi davvero eliminare TUTTE le foto e descrizioni?")) {
        localStorage.removeItem("gallery");
        loadGallery();
        alert("Galleria svuotata!");
    }
});
