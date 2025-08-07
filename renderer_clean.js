// Sistema de Finanzas - Frontend JavaScript
// Versión web compatible con navegadores

class FinanceApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.categories = [];
        this.transactions = [];
        this.scheduledExpenses = [];
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        
        // Asegurar que currentSection esté establecido ANTES de cambiar de sección
        this.currentSection = 'dashboard';
        this.switchSection('dashboard');
        this.updateDashboard();

        // Solo cargar datos de gastos programados al iniciar, sin interfaz
        await this.loadScheduledExpensesDataOnly();
        
        // Configurar limpieza simple de scheduled
        this.setupSimpleScheduledCleaner();
    }
    
    // Función simple para limpiar elementos scheduled fuera de su sección
    setupSimpleScheduledCleaner() {
        console.log('🔧 Configurando limpieza simple de scheduled');
        
        // Limpiar cada 3 segundos
        setInterval(() => {
            if (this.currentSection !== 'scheduled') {
                this.simpleCleanScheduled();
            }
        }, 3000);
    }
    
    // Función simple de limpieza
    simpleCleanScheduled() {
        const forbiddenSections = ['#reports-section', '#transactions-section', '#categories-section', '#dashboard-section'];
        
        forbiddenSections.forEach(sectionSelector => {
            const section = document.querySelector(sectionSelector);
            if (section) {
                const elementsToRemove = section.querySelectorAll('[id*="scheduled"], [class*="scheduled"]');
                elementsToRemove.forEach(el => el.remove());
                
                // Buscar y eliminar por contenido específico
                const allElements = section.querySelectorAll('*');
                allElements.forEach(el => {
                    const text = el.textContent || '';
                    if (text.includes('💸 Membresías y Gastos Programados') ||
                        text.includes('Nuevo Gasto Programado') ||
                        text.includes('Exportar Excel')) {
                        el.remove();
                    }
                });
            }
        });
    }

    // Cargar datos de gastos programados sin mostrar interfaz
    async loadScheduledExpensesDataOnly() {
        try {
            const response = await fetch('/api/scheduled-expenses');
            if (response.ok) {
                this.scheduledExpenses = await response.json();
                console.log('📊 Datos de gastos programados cargados:', this.scheduledExpenses.length);
            }
        } catch (error) {
            console.error('Error cargando datos de gastos programados:', error);
        }
    }

    // FUNCIONES BÁSICAS DE LA APLICACIÓN
    
    async loadData() {
        try {
            await Promise.all([
                this.loadCategories(),
                this.loadTransactions()
            ]);
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                this.categories = await response.json();
            } else {
                console.error('Error cargando categorías');
                this.categories = [
                    { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
                    { id: 2, name: "🩺 Veterinario", type: "expense" },
                    { id: 3, name: "🎮 Entretenimiento", type: "expense" },
                    { id: 4, name: "💼 Trabajo", type: "income" }
                ];
            }
        } catch (error) {
            console.error('Error:', error);
            this.categories = [
                { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
                { id: 2, name: "🩺 Veterinario", type: "expense" },
                { id: 3, name: "🎮 Entretenimiento", type: "expense" },
                { id: 4, name: "💼 Trabajo", type: "income" }
            ];
        }
    }

    async loadTransactions() {
        try {
            const response = await fetch('/api/transactions');
            if (response.ok) {
                this.transactions = await response.json();
            } else {
                console.error('Error cargando transacciones');
                this.transactions = [];
            }
        } catch (error) {
            console.error('Error:', error);
            this.transactions = [];
        }
    }

    setupEventListeners() {
        // Event listeners para navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Event listeners para modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModals();
            }
        });

        // Event listener para ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Event listeners para filtros
        const categoryFilter = document.getElementById('category-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');
        
        if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterTransactions());
        if (typeFilter) typeFilter.addEventListener('change', () => this.filterTransactions());
        if (dateFilter) dateFilter.addEventListener('change', () => this.filterTransactions());
    }

    switchSection(sectionName) {
        console.log(`🔄 Cambiando a sección: ${sectionName}`);
        
        // Actualizar variable ANTES de cualquier operación
        this.currentSection = sectionName;
        
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Cargar contenido específico según la sección
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'transactions':
                this.renderTransactionsTable();
                this.renderCategoryFilter();
                break;
            case 'categories':
                this.renderCategoriesGrid();
                break;
            case 'reports':
                this.generateReports();
                break;
            case 'scheduled':
                this.loadScheduledExpenses();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
        
        // Limpiar elementos scheduled si no estamos en esa sección
        setTimeout(() => {
            if (sectionName !== 'scheduled') {
                this.simpleCleanScheduled();
            }
        }, 100);
    }

    updateDashboard() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        const balance = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = this.formatCurrency(totalIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('current-balance').textContent = this.formatCurrency(balance);

        // Actualizar gráfico si existe Chart.js
        if (typeof Chart !== 'undefined') {
            this.updateDashboardChart();
        }
    }

    renderTransactionsTable(transactionsToRender = this.transactions) {
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        transactionsToRender.forEach(transaction => {
            const row = document.createElement('tr');
            const category = this.categories.find(c => c.id == transaction.category_id);
            
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td>${category ? category.name : 'Sin categoría'}</td>
                <td>${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                <td class="${transaction.type}">${this.formatCurrency(transaction.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="window.app.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderCategoriesGrid() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        grid.innerHTML = '';

        this.categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.innerHTML = `
                <h3>${category.name}</h3>
                <p>Tipo: ${category.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
                <div class="category-actions">
                    <button class="btn btn-sm btn-danger" onclick="window.app.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            `;
            grid.appendChild(categoryCard);
        });
    }

    renderCategoryFilter() {
        const select = document.getElementById('category-filter');
        if (!select) return;
        
        select.innerHTML = '<option value="">Todas las categorías</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    filterTransactions() {
        const categoryFilter = document.getElementById('category-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');
        
        let filtered = this.transactions;
        
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(t => t.category_id == categoryFilter.value);
        }
        
        if (typeFilter && typeFilter.value) {
            filtered = filtered.filter(t => t.type === typeFilter.value);
        }
        
        if (dateFilter && dateFilter.value) {
            filtered = filtered.filter(t => t.date === dateFilter.value);
        }
        
        this.renderTransactionsTable(filtered);
    }

    // FUNCIONES DE GASTOS PROGRAMADOS
    async loadScheduledExpenses() {
        try {
            const response = await fetch('/api/scheduled-expenses');
            if (response.ok) {
                this.scheduledExpenses = await response.json();
                this.renderScheduledExpensesTable();
            } else {
                console.error('Error cargando gastos programados');
                this.scheduledExpenses = [];
                this.renderScheduledExpensesTable();
            }
        } catch (error) {
            console.error('Error:', error);
            this.scheduledExpenses = [];
            this.renderScheduledExpensesTable();
        }
    }

    renderScheduledExpensesTable() {
        const tbody = document.getElementById('scheduled-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.scheduledExpenses.forEach(expense => {
            const row = document.createElement('tr');
            const category = this.categories.find(c => c.id == expense.category_id);
            
            row.innerHTML = `
                <td>${expense.description}</td>
                <td>${category ? category.name : 'Sin categoría'}</td>
                <td>${this.formatCurrency(expense.amount)}</td>
                <td>${expense.frequency}</td>
                <td>${expense.next_date}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="window.app.executeScheduledExpense(${expense.id})">
                        <i class="fas fa-play"></i> Ejecutar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.app.deleteScheduledExpense(${expense.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // MODALES Y FORMULARIOS
    showTransactionModal() {
        document.getElementById('transaction-modal').style.display = 'flex';
        this.populateTransactionCategorySelect();
    }

    showCategoryModal() {
        document.getElementById('category-modal').style.display = 'flex';
    }

    showScheduledModal() {
        document.getElementById('scheduled-modal').style.display = 'flex';
        this.populateScheduledCategorySelect();
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    populateTransactionCategorySelect() {
        const select = document.getElementById('transaction-category');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecciona una categoría</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    populateScheduledCategorySelect() {
        const select = document.getElementById('scheduled-category');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecciona una categoría</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    // FUNCIONES DE GUARDADO
    async saveTransaction() {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);
        
        const transaction = {
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            type: formData.get('type'),
            category_id: parseInt(formData.get('category_id')),
            date: formData.get('date'),
            notes: formData.get('notes') || ''
        };

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(transaction)
            });

            if (response.ok) {
                await this.loadTransactions();
                this.closeModals();
                form.reset();
                this.updateDashboard();
                this.renderTransactionsTable();
                this.showNotification('Transacción guardada exitosamente', 'success');
            } else {
                this.showNotification('Error al guardar la transacción', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async saveCategory() {
        const form = document.getElementById('category-form');
        const formData = new FormData(form);
        
        const category = {
            name: formData.get('name'),
            type: formData.get('type')
        };

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category)
            });

            if (response.ok) {
                await this.loadCategories();
                this.closeModals();
                form.reset();
                this.renderCategoriesGrid();
                this.showNotification('Categoría guardada exitosamente', 'success');
            } else {
                this.showNotification('Error al guardar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async saveScheduledExpense() {
        const form = document.getElementById('scheduled-form');
        const formData = new FormData(form);
        
        const scheduledExpense = {
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            category_id: parseInt(formData.get('category_id')),
            frequency: formData.get('frequency'),
            next_date: formData.get('next_date'),
            notes: formData.get('notes') || ''
        };

        try {
            const response = await fetch('/api/scheduled-expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scheduledExpense)
            });

            if (response.ok) {
                await this.loadScheduledExpenses();
                this.closeModals();
                form.reset();
                this.showNotification('Gasto programado guardado exitosamente', 'success');
            } else {
                this.showNotification('Error al guardar el gasto programado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    // FUNCIONES DE ELIMINACIÓN
    async deleteTransaction(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return;

        try {
            const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await this.loadTransactions();
                this.updateDashboard();
                this.renderTransactionsTable();
                this.showNotification('Transacción eliminada exitosamente', 'success');
            } else {
                this.showNotification('Error al eliminar la transacción', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async deleteCategory(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

        try {
            const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await this.loadCategories();
                this.renderCategoriesGrid();
                this.showNotification('Categoría eliminada exitosamente', 'success');
            } else {
                this.showNotification('Error al eliminar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async deleteScheduledExpense(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este gasto programado?')) return;

        try {
            const response = await fetch(`/api/scheduled-expenses/${id}`, { method: 'DELETE' });
            if (response.ok) {
                await this.loadScheduledExpenses();
                this.showNotification('Gasto programado eliminado exitosamente', 'success');
            } else {
                this.showNotification('Error al eliminar el gasto programado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    // FUNCIONES AUXILIARES
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    generateReports() {
        // Implementar generación de reportes
        console.log('Generando reportes...');
    }

    loadSettings() {
        // Implementar carga de configuraciones
        console.log('Cargando configuraciones...');
    }

    async executeScheduledExpense(id) {
        if (!confirm('¿Ejecutar este gasto programado ahora?')) return;

        try {
            const response = await fetch(`/api/scheduled-expenses/${id}/execute`, { method: 'POST' });
            if (response.ok) {
                await this.loadTransactions();
                await this.loadScheduledExpenses();
                this.updateDashboard();
                this.showNotification('Gasto programado ejecutado exitosamente', 'success');
            } else {
                this.showNotification('Error al ejecutar el gasto programado', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    exportToExcel() {
        const categoryFilter = document.getElementById('category-filter');
        const typeFilter = document.getElementById('type-filter');
        const dateFilter = document.getElementById('date-filter');
        
        let filtered = this.transactions;
        
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(t => t.category_id == categoryFilter.value);
        }
        
        if (typeFilter && typeFilter.value) {
            filtered = filtered.filter(t => t.type === typeFilter.value);
        }
        
        if (dateFilter && dateFilter.value) {
            filtered = filtered.filter(t => t.date === dateFilter.value);
        }
        
        let csv = 'Descripción,Monto,Tipo,Categoría,Fecha,Notas\n';
        filtered.forEach(t => {
            const category = this.categories.find(c => c.id == t.category_id);
            csv += `"${t.description.replace(/"/g, '""')}","${t.amount}","${t.type}","${category ? category.name : ''}","${t.date}","${t.notes ? t.notes.replace(/"/g, '""') : ''}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transacciones.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
});
