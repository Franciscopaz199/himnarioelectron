const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process');
app.commandLine.appendSwitch('disable-gpu-vsync');

let mainWindow
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Habilitar nodeIntegration (si es necesario)
            contextIsolation: false // Desactivar contextIsolation
        }
    })
    mainWindow.loadFile('index.html')
    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// Lanza la ventana cuando Electron esté listo
app.whenReady().then(createWindow)

// Escuchar el evento para recibir el número de pista
ipcMain.on('input-submitted', (event, pista) => {

    // Ruta al archivo que deseas abrir
    if (pista.artista == 'Iglesia') {
        filePath = path.join(__dirname, 'pistas', 'iglesiadeDios', pista.numero + '.mp3')
    }
    else {
        filePath = path.join(__dirname, 'pistas', 'carlosOrtes', pista.numero + '.mp3')
    }

    // abrir la diapositiva
    exec(`start "${path.join(__dirname, 'diapositivas/ppsx', pista.numero + '.ppsx')}"`, (err, stdout, stderr) => {
        if (err) {
            event.reply('display-input', `Diapositiva no encontrada`)  // Esto lo mostrará en el navegador
            console.error(`Error al abrir la diapositiva: ${err}`);
            return;
        }
        console.log('Diapositiva abierta exitosamente');
    });


    // Comando para abrir el archivo con la aplicación predeterminada en Linux
    exec(`start "${filePath}"`, (err, stdout, stderr) => {
        if (err) {
            event.reply('display-input', `Archivo no encontrado`)  // Esto lo mostrará en el navegador
            console.error(`Error al abrir el archivo: ${err}`);
            return;
        }
        console.log('Archivo abierto exitosamente');
    });




    console.log(`Número de pista ingresado: ${pista.numero}`)  // Mostrar en la consola (opcional)
    // Responder al renderer con la pista que se ingresó
    event.reply('display-input', `Pista ${pista.numero}`)  // Esto lo mostrará en el navegador
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
