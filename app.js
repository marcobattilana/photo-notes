// -------------------------------------------
// PHOTO NOTES – Versione con INVERTI CAMERA
// Funziona 100% su iPhone 11 / Safari / PWA
// -------------------------------------------

document.addEventListener("DOMContentLoaded", loadGallery);

const video = document.getElementById("cameraView");
const preview = document.getElementById("preview");
const desc = document.getElementById("description");

let stream = null;
let lastPhoto = null;
let flashEnabled = false;
let videoTrack = null;


let videoDevices = [];
let currentDeviceIndex = 0;

// -------------------------------------------
// OTTIENI TUTTE LE VIDEOCAMERE
// -------------------------------------------
async function loadCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(d => d.kind === "videoinput");
}

// -------------------------------------------
// AVVIA CAMERA SECONDO UN INDEX
// -------------------------------------------
async function startCamera(deviceIndex = 0) {
    try {
        await loadCameras();

        if (videoDevices.length === 0) {
            alert("Nessuna fotocamera trovata");
            return;
        }

        currentDeviceIndex = deviceIndex % videoDevices.length;

       stream = await navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: { ideal: "environment" } // usa sempre la posteriore
    }
});

video.srcObject = stream;
video.play();

// ottengo la traccia video per il flash
videoTrack = stream.getVideoTracks()[0];

// abilito il pulsante flash
document.getElementById("flashBtn").disabled = false;


        document.getElementById("captureBtn").disabled = false;

    } catch (err) {
        alert("Errore nell'avviare la fotocamera");
        console.error(err);
    }
}

// -------------------------------------------
// INVERTI CAMERA
// -------------------------------------------
async function switchCamera() {
    if (!videoDevices.length) await loadCameras();

    currentDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length;

    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }

    startCamera(currentDeviceIndex);
}

// -------------------------------------------
// BOTTONE AVVIO CAMERA
// -------------------------------------------
document.getElementById("startCameraBtn").addEventListener("click", async () => {
    // primo avvio: cerca una camera posteriore
    await loadCameras();

    let index = videoDevices.findIndex(d =>
        /back|rear|environment/i.test(d.label)
    );

    if (index === -1) index = 0;

    startCamera(index);
});

// -------------------------------------------
// BOTTONE INVERTI CAMERA
// -------------------------------------------
document.getElementById("switchCameraBtn").addEventListener("click", switchCamera);



// -------------------------------------------
// SCATTA FOTO
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
// SALVA FOTO
// -------------------------------------------
document.getElementById("saveBtn").addEventListener("click", () => {
    if (!lastPhoto) {
        alert("Scatta prima una foto!");
        return;
    }

    const text = desc.value.trim();
    if (!text) {
        alert("Scrivi una descrizione!");
        return;
    }

    const entry = {
        id: "photo_" + Date.now(),
        img: lastPhoto,
        descr: text,
        date: new Date().toLocaleString()
    };

    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    arr.push(entry);
    localStorage.setItem("photoNotesCam", JSON.stringify(arr));

    desc.value = "";
    preview.src = "";
    lastPhoto = null;

    loadGallery();
});

// -------------------------------------------
// CARICA GALLERIA
// -------------------------------------------
function loadGallery() {
    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    const gal = document.getElementById("gallery");
    gal.innerHTML = "";

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
        gal.appendChild(div);
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
// DOWNLOAD FOTO
// -------------------------------------------
function downloadPhoto(id) {
    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    const item = arr.find(i => i.id === id);
    if (!item) return;

    const a = document.createElement("a");
    a.href = item.img;
    a.download = item.descr.replace(/[^a-z0-9]/gi, "_") + ".jpg";
    a.click();
}

// -------------------------------------------
// ESPORTA ZIP
// -------------------------------------------
document.getElementById("exportZipBtn").addEventListener("click", async () => {
    const arr = JSON.parse(localStorage.getItem("photoNotesCam") || "[]");
    if (!arr.length) return alert("Nessuna foto da esportare");

    const zip = new JSZip();
    const folder = zip.folder("PhotoNotes");

    arr.forEach(item => {
        const base64 = item.img.split(",")[1];
        folder.file(`${item.id}.jpg`, base64, { base64: true });
        folder.file(`${item.id}.txt`, `Descrizione: ${item.descr}\nData: ${item.date}`);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "galleria_photonotes.zip";
    a.click();
});

// -------------------------------------------
// ELIMINA TUTTO
// -------------------------------------------
document.getElementById("deleteAllBtn").addEventListener("click", () => {
    if (confirm("Eliminare TUTTE le foto e descrizioni?")) {
        localStorage.removeItem("photoNotesCam");
        loadGallery();
        alert("Galleria svuotata!");
    }
});
