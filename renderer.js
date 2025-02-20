// renderer.js (Proceso de renderizado de la interfaz)
const { ipcRenderer } = require('electron');
alert('Hola desde el proceso de renderizado');
// Interactuar con el DOM
document.getElementById('pistaInput').addEventListener('input', (event) => {
  const pista = event.target.value;
  console.log(`Pista ingresada: ${pista}`);
});

// Función para leer un archivo usando ipcRenderer
function leerArchivo() {
  const filePath = './diapositivas/1.txt'; // Ruta al archivo que deseas leer
  ipcRenderer.invoke('read-file', filePath)
    .then((content) => {
      console.log(content);
      alert(content); // Mostrar contenido en un alert (puedes personalizar la forma en que lo muestres)
    })
    .catch((err) => {
      alert(`Error al leer el archivo: ${err}`);
    });
}

// Conectar el botón para leer el archivo
document.getElementById('leerArchivoBtn').addEventListener('click', leerArchivo);
