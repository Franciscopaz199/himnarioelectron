const { ipcRenderer } = require('electron');

document.getElementById("downloadBtn").addEventListener("click", async () => {
    document.getElementById("status").textContent = "Descargando...";
    const result = await ipcRenderer.invoke("download-file");
    if (result.success) {
        document.getElementById("status").textContent = "Descarga completada en: " + result.filePath;
        alert("Descarga completada en: " + result.filePath);
    } else {
        document.getElementById("status").textContent = "Error: " + result.message;
    }
});

// Recibir el progreso de la descarga
ipcRenderer.on('download-progress', (event, progress) => {
    const progressBar = document.getElementById("progressBar");
    alert(progress);
    progressBar.value = progress; // Actualizar la barra de progreso
    document.getElementById("progressText").textContent = `Progreso: ${Math.round(progress)}%`; // Texto del progreso
});

// Cuando la descarga se complete, actualizar el estado
window.electron.onDownloadComplete((data) => {
    if (data.success) {
        document.getElementById("status").textContent = "Descarga exitosa: " + data.filePath;
    } else {
        document.getElementById("status").textContent = "Error en la descarga: " + data.message;
    }
});
