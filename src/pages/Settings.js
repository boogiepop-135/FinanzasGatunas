import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    currency: 'MXN',
    language: 'es',
    theme: 'pink',
    notifications: true,
    autoBackup: false
  });

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadSettings();
    loadData();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('finanzasGatunasSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const loadData = async () => {
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ]);

      if (transactionsRes.ok) {
        setTransactions(await transactionsRes.json());
      }
      
      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json());
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('finanzasGatunasSettings', JSON.stringify(settings));
    showNotification('Configuración guardada exitosamente', 'success');
  };

  const exportDatabase = () => {
    const data = {
      transactions,
      categories,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas_gatunas_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Base de datos exportada exitosamente', 'success');
  };

  const importDatabase = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.transactions && data.categories) {
          // En una aplicación real, aquí enviarías los datos al servidor
          showNotification('Base de datos importada exitosamente', 'success');
          console.log('Datos importados:', data);
        } else {
          showNotification('Archivo de respaldo inválido', 'error');
        }
      } catch (error) {
        showNotification('Error al leer el archivo de respaldo', 'error');
      }
    };
    reader.readAsText(file);
  };

  const backupDatabase = () => {
    exportDatabase();
    showNotification('Respaldo creado exitosamente', 'success');
  };

  const resetDatabase = () => {
    if (!window.confirm('⚠️ ¿Estás seguro de que quieres resetear TODA la base de datos? Esta acción NO se puede deshacer.')) {
      return;
    }

    if (!window.confirm('🚨 ÚLTIMA ADVERTENCIA: Esto eliminará TODAS tus transacciones, categorías y configuraciones. ¿Continuar?')) {
      return;
    }

    // En una aplicación real, aquí harías las llamadas al API para limpiar la base de datos
    localStorage.removeItem('finanzasGatunasSettings');
    showNotification('Base de datos reseteada. Recarga la página para ver los cambios.', 'success');
  };

  const showNotification = (message, type) => {
    alert(message);
  };

  const getStorageUsage = () => {
    const data = JSON.stringify({ transactions, categories, settings });
    const sizeInBytes = new Blob([data]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return sizeInKB;
  };

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>👑 Configuración Real Gatuna</h2>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px'}}>
        
        {/* Configuración General */}
        <div className="settings-card">
          <h3>⚙️ Configuración General</h3>
          
          <div className="form-group">
            <label>💱 Moneda:</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({...settings, currency: e.target.value})}
            >
              <option value="USD">USD ($) - Dólar Americano</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="MXN">MXN ($) - Peso Mexicano</option>
              <option value="COP">COP ($) - Peso Colombiano</option>
              <option value="ARS">ARS ($) - Peso Argentino</option>
            </select>
          </div>

          <div className="form-group">
            <label>🌍 Idioma:</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="form-group">
            <label>🎨 Tema:</label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value})}
            >
              <option value="pink">Rosa Gatuno 🌸</option>
              <option value="blue">Azul Gatuno 💙</option>
              <option value="purple">Morado Gatuno 💜</option>
              <option value="green">Verde Gatuno 💚</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
              />
              🔔 Activar notificaciones
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
              />
              💾 Respaldo automático semanal
            </label>
          </div>

          <button className="btn btn-primary" onClick={saveSettings}>
            <i className="fas fa-save"></i> Guardar Configuración
          </button>
        </div>

        {/* Base de Datos */}
        <div className="settings-card">
          <h3>🗄️ Gestión de Base de Datos</h3>
          
          <div className="db-stats">
            <p><strong>📊 Estadísticas:</strong></p>
            <ul>
              <li>🐾 Transacciones: {transactions.length}</li>
              <li>💖 Categorías: {categories.length}</li>
              <li>💾 Almacenamiento: {getStorageUsage()} KB</li>
              <li>📅 Última actualización: {new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          <div className="db-actions">
            <button className="btn btn-success" onClick={exportDatabase}>
              <i className="fas fa-download"></i> Exportar BD
            </button>

            <button 
              className="btn btn-primary" 
              onClick={() => document.getElementById('import-file').click()}
            >
              <i className="fas fa-upload"></i> Importar BD
            </button>
            <input 
              type="file" 
              id="import-file" 
              accept=".json" 
              style={{display: 'none'}}
              onChange={importDatabase}
            />

            <button className="btn btn-secondary" onClick={backupDatabase}>
              <i className="fas fa-save"></i> Crear Respaldo
            </button>

            <button className="btn btn-danger" onClick={resetDatabase}>
              <i className="fas fa-trash"></i> Resetear BD
            </button>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="settings-card">
          <h3>ℹ️ Información del Sistema</h3>
          
          <div className="system-info">
            <p><strong>🐱 Finanzas Gatunas v1.0.0</strong></p>
            <p>Sistema de gestión financiera personal</p>
            
            <div className="features-list">
              <h4>✨ Características:</h4>
              <ul>
                <li>✅ Gestión de transacciones</li>
                <li>✅ Categorías personalizadas</li>
                <li>✅ Gastos programados</li>
                <li>✅ Reportes detallados</li>
                <li>✅ Exportación de datos</li>
                <li>✅ Interfaz responsive</li>
                <li>✅ Tema personalizable</li>
              </ul>
            </div>
            
            <div className="support-info">
              <h4>📞 Soporte:</h4>
              <p>Para soporte técnico o sugerencias:</p>
              <p>📧 finanzas.gatunas@example.com</p>
              <p>🐱 ¡Miau! Gracias por usar Finanzas Gatunas</p>
            </div>
          </div>
        </div>

        {/* Atajos de Teclado */}
        <div className="settings-card">
          <h3>⌨️ Atajos de Teclado</h3>
          
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Ctrl + N</kbd>
              <span>Nueva transacción</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + K</kbd>
              <span>Nueva categoría</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + S</kbd>
              <span>Guardar cambios</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl + E</kbd>
              <span>Exportar datos</span>
            </div>
            <div className="shortcut-item">
              <kbd>Esc</kbd>
              <span>Cerrar modal</span>
            </div>
            <div className="shortcut-item">
              <kbd>F5</kbd>
              <span>Actualizar datos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
