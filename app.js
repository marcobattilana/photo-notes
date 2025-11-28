// PHOTO NOTES — app.js CORRETTO E COMPATIBILE

document.addEventListener("DOMContentLoaded", loadGallery);

// ELEMENTI
const video = document.getElementById("cameraView");
const preview = document.getElementById("preview");
const descInput = document.getElementById("description");

let stream = null;
let lastPhoto = null;

// -------------------------------------------
// AVVIO FOTOCAMERA (con posteriore su iPhone)
// -------------------------------------------

document.getElementById("startCameraBtn").addEventListener("click", async () => {
    try {

        // 1️⃣ tenta la fotocamera posteriore vera
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } }
            });
        } catch (e) {
            // 2️⃣ fallback: prende quella dietro, ma senza exact
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
        }

        video.srcObject = stream;
        video.play();

        document.getElementById("captureBtn").disabled = false;

    } catch (error) {
        alert("Errore nell’avvio della fotocamera");
        console.error(error);
    }
});

// -------------------------------------------
// SCATTO FOTO
// -------------------------------------------

document.getElementById("captureBtn").addEventListener("click", () => {
    if (!stream) {
        alert("Avvia prima la fotocamera!");
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

// -------------------------------------------
// SALVA FOTO + DESCRIZIONE
// -------------------------------------------

document.getElementById("saveBtn").addEventListener("click", () => {
    if (!lastPhoto) {
        alert("Scatta prima una foto!");
        return;
    }

    const descr = descInput.value.trim();
    if (!descr) {
        alert("Scrivi una descrizione!");
        return;
    }

    const entry = {
        id: "photo_" + Date.now(),
        img: lastPhoto,
        descr: descr,
        date: new Date().toLocaleString()
    };

    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    arr.push(entry);
    localStorage.setItem("photoNotesCam", JSON.stringify(arr));

    descInput.value = "";
    preview.src = "";
    lastPhoto = null;

    loadGallery();
});

// -------------------------------------------
// CARICA GALLERIA
// -------------------------------------------

function loadGallery() {
    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    arr.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${item.img}" class="thumb">
            <div class="title">${item.descr}</div>
            <div class="date">${item.date}</div>
            <button onclick="downloadPhoto('${item.id}')">⬇️ Scarica</button>
            <button onclick="deletePhoto('${item.id}')">🗑️ Elimina</button>
        `;
        gallery.appendChild(card);
    });
}

// -------------------------------------------
// ELIMINA SINGOLA FOTO
// -------------------------------------------

function deletePhoto(id) {
    let arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    arr = arr.filter(i => i.id !== id);
    localStorage.setItem("photoNotesCam", JSON.stringify(arr));
    loadGallery();
}

// -------------------------------------------
// SCARICA UNA SINGOLA FOTO
// -------------------------------------------

function downloadPhoto(id) {
    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    const item =
