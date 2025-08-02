const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const { PythonShell } = require('python-shell');

let mainWindow;
let pythonServer = null;

function createWindow() {
    // Crear la ventana del navegador
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        title: '🐱 Finanzas Gatunas 💖',
        show: false, // No mostrar hasta que esté listo
        backgroundColor: '#ffe4e1', // Color de fondo rosado
        titleBarStyle: 'default',
        frame: true
    });

    // Cargar el archivo HTML
    mainWindow.loadFile('index.html');

    // Mostrar la ventana cuando esté lista
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Opcional: Abrir las herramientas de desarrollo en modo desarrollo
        if (process.env.NODE_ENV === 'development') {
            mainWindow.webContents.openDevTools();
        }
    });

    // Manejar cuando se cierra la ventana
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Prevenir la navegación a URLs externas
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
}

// Crear menú personalizado
function createMenu() {
    const template = [
        {
            label: '🐱 Finanzas Gatunas',
            submenu: [
                {
                    label: 'Acerca de',
                    click: () => {
                        require('electron').dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: '🐱 Finanzas Gatunas 💖',
                            message: 'Sistema de Gestión Financiera con Tema Gatuno',
                            detail: 'Versión 1.0.0\n\n¡Disfruta gestionando tus finanzas de manera adorable! 🐱💖',
                            buttons: ['¡Me encanta! 🐱']
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Salir',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Ver',
            submenu: [
                { role: 'reload', label: 'Recargar' },
                { role: 'forceReload', label: 'Forzar Recarga' },
                { role: 'toggleDevTools', label: 'Herramientas de Desarrollo' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Zoom Normal' },
                { role: 'zoomIn', label: 'Aumentar Zoom' },
                { role: 'zoomOut', label: 'Disminuir Zoom' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Pantalla Completa' }
            ]
        },
        {
            label: 'Ventana',
            submenu: [
                { role: 'minimize', label: 'Minimizar' },
                { role: 'close', label: 'Cerrar' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Iniciar servidor Python
function startPythonServer() {
    const pythonPath = path.join(__dirname, 'python_backend', 'simple_server.py');
    
    const options = {
        mode: 'text',
        pythonPath: 'python3',
        pythonOptions: ['-u'],
        scriptPath: path.join(__dirname, 'python_backend'),
        args: []
    };

    try {
        pythonServer = new PythonShell('simple_server.py', options);
        
        pythonServer.on('message', function (message) {
            console.log('Python:', message);
        });

        pythonServer.on('error', function (err) {
            console.error('Error en servidor Python:', err);
        });

        pythonServer.on('close', function () {
            console.log('Servidor Python cerrado');
        });

        console.log('Servidor Python iniciado');
    } catch (error) {
        console.error('Error iniciando servidor Python:', error);
    }
}

// Detener servidor Python
function stopPythonServer() {
    if (pythonServer) {
        pythonServer.kill();
        pythonServer = null;
        console.log('Servidor Python detenido');
    }
}

// Eventos de la aplicación
app.whenReady().then(() => {
    createWindow();
    createMenu();
    startPythonServer();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    stopPythonServer();
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    stopPythonServer();
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
});

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('get-app-name', () => {
    return app.getName();
}); 