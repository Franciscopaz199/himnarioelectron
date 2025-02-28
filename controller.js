const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { exec } = require('child_process');
const fs = require('fs'); // Importar el módulo fs
const https = require("https");
const request = require('request');
const axios = require('axios');
app.commandLine.appendSwitch('disable-gpu-vsync');
// Obtener la ruta donde debería estar la carpeta 'data'
const rutaData = path.join(process.env.APPDATA || process.env.HOME || process.env.USERPROFILE, 'himnario2.0', 'data');

// Verificar si la carpeta 'data' existe

let mainWindow;
function createWindow() { // comentario
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Habilitar nodeIntegration (si es necesario)
            contextIsolation: false // Desactivar contextIsolation
        },
        
    })

    validarExistenciaCarpeta('data'); // Llamar a la función para validar la carpeta

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// Lanza la ventana cuando Electron esté listo
app.whenReady().then(createWindow)

function validarExistenciaCarpeta(nombreCarpeta) {
    // Obtener la ruta absoluta de la carpeta
    const rutaCarpeta = path.join(__dirname, nombreCarpeta);

    // Verificar si la carpeta existe
    fs.access(rutaData, fs.constants.F_OK, (err) => {
        if (err) {
            // Si la carpeta no existe, redirigir a la página de descarga
            mainWindow.webContents.send('mensaje', rutaData);
            console.log(`La carpeta "${nombreCarpeta}" no existe. Redirigiendo a la página de descarga...`);
            mainWindow.loadFile('./pages/descarga.html');
        } else {
            // Si la carpeta existe, verificar si es realmente una carpeta
            fs.stat(rutaData, (err, stats) => {
                if (err) {
                    console.error('Error al verificar la carpeta:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // Si es una carpeta, redirigir a la página principal
                    console.log(`La carpeta "${nombreCarpeta}" existe. Redirigiendo a la página de inicio...`);
                    mainWindow.loadFile('./pages/inicio.html');
                    inicioController.main();
                } else {
                    // Si no es una carpeta, redirigir a la página de descarga
                    mainWindow.webContents.send('mensaje', 'La carpeta no es válida en'+rutaCarpeta);
                    console.log(`"${nombreCarpeta}" no es una carpeta. Redirigiendo a la página de descarga...`);
                    mainWindow.loadFile('./pages/descarga.html');
                  
                }
            });
        }
    });
}

ipcMain.on('input-submitted', (event, pista) => {
    // bucar el numero de pista pista.numero en la carpeta data/pistas/pista.artista
    // en caso de no encontrar la pista, enviar un mensaje al renderer
    const filePath =  rutaData+ '/pistas/' + pista.artista + '/' + pista.numero + '.mp3';
    const diapsitivaPath = rutaData + '/diapositivas/ppsx/' + pista.numero + '.ppsx';
    console.log(pista);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            event.reply('display-input', `Pista no encontrada`);
            console.error(`Error al abrir la pista: ${err}`);
            mainWindow.webContents.send('error-modal', 'Pista no encontrada');
            return;
        }

        // Comando para abrir el archivo con la aplicación predeterminada en windows
        console.log(`Abriendo pista: ${filePath}`);
        exec(`start ${filePath}`, (err, stdout, stderr) => {
            if (err) {
                event.reply('display-input', `Pista no encontrada`);
                console.error(`Error al abrir la pista: ${err}`);
                return;
            }
            console.log('Pista abierta exitosamente');
        });


        // abrir la diapositiva
        if (pista.diapositiva) {
            fs.access(diapsitivaPath, fs.constants.F_OK, (err) => {
                if (err) {
                    event.reply('display-input', `Diapositiva no encontrada`);
                    console.error(`Error al abrir la diapositiva: ${err}`);
                    return;
                }

                // Comando para abrir el archivo con la aplicación predeterminada en windows
                console.log(`Abriendo diapositiva: ${diapsitivaPath}`);
                exec(`start ${diapsitivaPath}`, (err, stdout, stderr) => {
                    if (err) {
                        event.reply('display-input', `Diapositiva no encontrada`);
                        console.error(`Error al abrir la diapositiva: ${err}`);
                        return;
                    }
                    console.log('Diapositiva abierta exitosamente');
                });


                // Enviar el número de pista al renderer


                console.log(`Número de pista ingresado: ${pista.numero}`);
                event.reply('display-input', `Pista ${pista.numero}`);
            });
        }

    }
    );
});






const inicioController = {
    leerCarpetas: () => {
        // Obtener los nombres de las carpetas dentro de la carpeta "data" y crear un array con los nombres
        fs.readdir(rutaData + '/pistas', (err, files) => {
            if (err) {
                console.error('Error al leer la carpeta:', err);
                mainWindow.webContents.send('error-modal', 'Error al leer la carpeta');
                return;
            }

            // Enviar los nombres de las carpetas al renderer
            mainWindow.webContents.send('leer-carpetas', files);
        });
    },
    main: () => {
        inicioController.leerCarpetas();
    }
} 
