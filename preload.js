const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Obtener información de la aplicación
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppName: () => ipcRenderer.invoke('get-app-name'),
    
    // Notificaciones del sistema
    showNotification: (title, body) => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, { body });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, { body });
                    }
                });
            }
        }
    }
});

// Configurar notificaciones
window.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}); 