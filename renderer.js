// Sistema de Finanzas - Frontend JavaScript
// Versión web compatible con navegadores

class FinanceApp {
    renderCategoryFilter() {
        const select = document.getElementById('filter-category');
        if (!select) return;
        select.innerHTML = '<option value="">Todas las categorías</option>';
        if (!this.categories) return;
        this.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    }

    filterTransactions() {
        const categoryFilter = document.getElementById('filter-category');
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
        this.updateFilteredSum(filtered);
    }

    updateFilteredSum(filtered) {
        const sum = filtered.reduce((acc, t) => acc + (parseFloat(t.amount) || 0), 0);
        const sumEl = document.getElementById('filtered-sum');
        if (sumEl) {
            sumEl.textContent = this.formatCurrency(sum);
        }
    }

    exportToExcel() {
        // Exportar tabla de transacciones filtradas a Excel (CSV)
        const categoryFilter = document.getElementById('filter-category');
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
            csv += `"${t.description.replace(/"/g, '""')}","${t.amount}","${t.type}","${t.category_name || ''}","${t.date}","${t.notes ? t.notes.replace(/"/g, '""') : ''}"\n`;
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
    constructor() {
        this.currentSection = 'dashboard';
        this.categories = [];
        this.transactions = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.switchSection('dashboard');
        this.updateDashboard();

        // Cargar gastos programados al iniciar
        this.loadScheduledExpenses();
    }
    // ================= GASTOS PROGRAMADOS Y MEMBRESÍAS =================
    async loadScheduledExpenses() {
        try {
            const response = await fetch('/api/scheduled_expenses');
            if (response.ok) {
                this.scheduledExpenses = await response.json();
            } else {
                this.scheduledExpenses = [];
            }
        } catch (e) {
            this.scheduledExpenses = [];
        }
        this.renderScheduledExpensesTable();
        this.setupScheduledEvents();
        this.setupScheduledFilters();
        console.log('Gastos programados cargados:', this.scheduledExpenses.length);
    }

    async loadScheduledExpensesDataOnly() {
        try {
            const response = await fetch('/api/scheduled_expenses');
            if (response.ok) {
                this.scheduledExpenses = await response.json();
            } else {
                this.scheduledExpenses = [];
            }
        } catch (e) {
            this.scheduledExpenses = [];
        }
        console.log('Datos de gastos programados cargados:', this.scheduledExpenses.length);
    }

    setupScheduledFilters() {
        // Llenar filtro de categorías
        this.renderScheduledCategoryFilter();
        
        // Event listeners para filtros
        const categoryFilter = document.getElementById('scheduled-category-filter');
        const searchFilter = document.getElementById('scheduled-search');
        const exportBtn = document.getElementById('export-scheduled-excel');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterScheduledExpenses();
            });
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', () => {
                this.filterScheduledExpenses();
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportScheduledToExcel();
            });
        }
        
        // Filtrar inicialmente para mostrar todos y calcular total
        this.filterScheduledExpenses();
    }

    renderScheduledCategoryFilter() {
        const select = document.getElementById('scheduled-category-filter');
        if (!select) return;
        
        select.innerHTML = '<option value="">Todas las categorías</option>';
        
        // Obtener categorías únicas de gastos programados
        const uniqueCategories = new Set();
        this.scheduledExpenses.forEach(exp => {
            if (exp.category) {
                uniqueCategories.add(exp.category);
            }
        });
        
        // Agregar categorías del sistema también
        if (this.categories) {
            this.categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.name;
                opt.textContent = cat.name;
                select.appendChild(opt);
            });
        }
    }

    filterScheduledExpenses() {
        const categoryFilter = document.getElementById('scheduled-category-filter');
        const searchFilter = document.getElementById('scheduled-search');
        
        let filtered = [...this.scheduledExpenses];
        
        // Filtrar por categoría
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(exp => 
                exp.category === categoryFilter.value || 
                exp.description.toLowerCase().includes(categoryFilter.value.toLowerCase())
            );
        }
        
        // Filtrar por búsqueda
        if (searchFilter && searchFilter.value.trim()) {
            const searchTerm = searchFilter.value.toLowerCase().trim();
            filtered = filtered.filter(exp => 
                exp.description.toLowerCase().includes(searchTerm) ||
                (exp.notes && exp.notes.toLowerCase().includes(searchTerm)) ||
                exp.frequency.toLowerCase().includes(searchTerm)
            );
        }
        
        // Renderizar tabla filtrada
        this.renderScheduledExpensesTable(filtered);
        
        // Calcular y mostrar total
        this.updateScheduledTotal(filtered);
    }

    updateScheduledTotal(filteredExpenses = null) {
        const expenses = filteredExpenses || this.scheduledExpenses;
        const total = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        
        // Crear o actualizar elemento de total
        let totalElement = document.getElementById('scheduled-total');
        if (!totalElement) {
            // Crear elemento de total si no existe
            const filtersDiv = document.querySelector('#scheduled-section .filters');
            if (filtersDiv) {
                totalElement = document.createElement('div');
                totalElement.id = 'scheduled-total';
                totalElement.className = 'scheduled-total';
                filtersDiv.appendChild(totalElement);
            }
        }
        
        if (totalElement) {
            const monthlyTotal = this.calculateMonthlyTotal(expenses);
            totalElement.innerHTML = `
                <div class="total-info">
                    <span class="total-label">Total programado:</span>
                    <span class="total-amount">${this.formatCurrency(total)}</span>
                </div>
                <div class="monthly-info">
                    <span class="monthly-label">Estimado mensual:</span>
                    <span class="monthly-amount">${this.formatCurrency(monthlyTotal)}</span>
                </div>
                <div class="count-info">
                    <span class="count-label">Mostrando:</span>
                    <span class="count-amount">${expenses.length} elementos</span>
                </div>
            `;
        }
    }

    calculateMonthlyTotal(expenses) {
        return expenses.reduce((sum, exp) => {
            const amount = parseFloat(exp.amount) || 0;
            switch (exp.frequency.toLowerCase()) {
                case 'mensual':
                case 'monthly':
                    return sum + amount;
                case 'anual':
                case 'yearly':
                case 'annual':
                    return sum + (amount / 12);
                case 'semanal':
                case 'weekly':
                    return sum + (amount * 4.33); // Promedio semanas por mes
                case 'diario':
                case 'daily':
                    return sum + (amount * 30);
                default:
                    return sum + amount; // Por defecto asumimos mensual
            }
        }, 0);
    }

    exportScheduledToExcel() {
        const categoryFilter = document.getElementById('scheduled-category-filter');
        const searchFilter = document.getElementById('scheduled-search');
        
        let filtered = [...this.scheduledExpenses];
        
        // Aplicar filtros actuales
        if (categoryFilter && categoryFilter.value) {
            filtered = filtered.filter(exp => 
                exp.category === categoryFilter.value || 
                exp.description.toLowerCase().includes(categoryFilter.value.toLowerCase())
            );
        }
        
        if (searchFilter && searchFilter.value.trim()) {
            const searchTerm = searchFilter.value.toLowerCase().trim();
            filtered = filtered.filter(exp => 
                exp.description.toLowerCase().includes(searchTerm) ||
                (exp.notes && exp.notes.toLowerCase().includes(searchTerm)) ||
                exp.frequency.toLowerCase().includes(searchTerm)
            );
        }
        
        // Crear CSV
        let csv = 'Descripción,Monto,Frecuencia,Próximo Pago,Notas\n';
        filtered.forEach(exp => {
            csv += `"${exp.description.replace(/"/g, '""')}","${exp.amount}","${exp.frequency}","${exp.next_payment}","${exp.notes ? exp.notes.replace(/"/g, '""') : ''}"\n`;
        });
        
        // Agregar totales al final
        const total = filtered.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        const monthlyTotal = this.calculateMonthlyTotal(filtered);
        csv += '\n';
        csv += `"TOTAL PROGRAMADO","${total}","","",""\n`;
        csv += `"ESTIMADO MENSUAL","${monthlyTotal}","","",""\n`;
        
        // Descargar archivo
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gastos_programados_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`✅ Exportados ${filtered.length} gastos programados`, 'success');
    }

    renderScheduledExpensesTable(expensesToRender = null) {
        const tbody = document.getElementById('scheduled-table-body');
        if (!tbody) return;
        
        const expenses = expensesToRender || this.scheduledExpenses;
        tbody.innerHTML = '';
        
        if (!expenses || expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-muted">No hay gastos programados que coincidan con los filtros</td></tr>';
            return;
        }
        
        expenses.forEach(exp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.description}</td>
                <td>${this.formatCurrency(exp.amount)}</td>
                <td>${exp.frequency}</td>
                <td>${exp.next_payment}</td>
                <td>${exp.notes || ''}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-edit-id="${exp.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" data-delete-id="${exp.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    setupScheduledEvents() {
        console.log('Configurando eventos de gastos programados...');
        
        // Configurar botón "Nuevo Gasto Programado"
        const newExpenseBtn = document.getElementById('newScheduledExpense');
        const formContainer = document.getElementById('scheduledFormContainer');
        const form = document.getElementById('scheduledForm');
        const cancelBtn = document.getElementById('cancelScheduled');
        const resetBtn = document.getElementById('resetScheduled');
        
        if (newExpenseBtn) {
            newExpenseBtn.onclick = () => {
                formContainer.style.display = 'block';
                newExpenseBtn.style.display = 'none';
            };
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                formContainer.style.display = 'none';
                newExpenseBtn.style.display = 'block';
                form.reset();
            };
        }
        
        if (resetBtn) {
            resetBtn.onclick = () => {
                form.reset();
            };
        }
        
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                
                // Validaciones
                const description = formData.get('description');
                const amount = formData.get('amount');
                const frequency = formData.get('frequency');
                const nextPayment = formData.get('next_payment');
                const expenseId = formData.get('id');
                
                if (!description || !amount || !frequency || !nextPayment) {
                    this.showNotification('Por favor completa todos los campos obligatorios', 'error');
                    return;
                }
                
                if (isNaN(amount) || parseFloat(amount) <= 0) {
                    this.showNotification('El monto debe ser un número válido mayor a 0', 'error');
                    return;
                }
                
                // Preparar datos
                const data = {
                    description: description,
                    amount: parseFloat(amount),
                    frequency: frequency,
                    next_payment: nextPayment,
                    notes: formData.get('notes') || ''
                };
                
                if (expenseId) {
                    data.id = expenseId;
                }
                
                // Agregar o editar gasto programado
                this.saveScheduledExpense(data);
                
                // Limpiar formulario
                form.reset();
                formContainer.style.display = 'none';
                newExpenseBtn.style.display = 'block';
            };
        }
        
        // Botones editar/eliminar en la tabla
        const tbody = document.getElementById('scheduled-table-body');
        if (!tbody) return;
        tbody.querySelectorAll('button[data-edit-id]').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-edit-id');
                const exp = this.scheduledExpenses.find(e => e.id == id);
                this.showScheduledModal(exp);
            };
        });
        tbody.querySelectorAll('button[data-delete-id]').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-delete-id');
                if (confirm('¿Eliminar este gasto programado?')) {
                    this.deleteScheduledExpense(id);
                }
            };
        });
    }

    showScheduledModal(expense = null) {
        const formContainer = document.getElementById('scheduledFormContainer');
        const newExpenseBtn = document.getElementById('newScheduledExpense');
        const form = document.getElementById('scheduledForm');
        
        if (expense) {
            // Llenar formulario con datos para edición
            form.querySelector('[name="description"]').value = expense.description || '';
            form.querySelector('[name="amount"]').value = expense.amount || '';
            form.querySelector('[name="frequency"]').value = expense.frequency || 'mensual';
            form.querySelector('[name="next_payment"]').value = expense.next_payment || '';
            form.querySelector('[name="notes"]').value = expense.notes || '';
            
            // Agregar ID oculto para edición
            let idInput = form.querySelector('[name="id"]');
            if (!idInput) {
                idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.name = 'id';
                form.appendChild(idInput);
            }
            idInput.value = expense.id;
        } else {
            // Nuevo gasto
            form.reset();
            const idInput = form.querySelector('[name="id"]');
            if (idInput) idInput.remove();
        }
        
        // Mostrar formulario
        formContainer.style.display = 'block';
        newExpenseBtn.style.display = 'none';
    }

    async saveScheduledExpense(data) {
        try {
            const isEdit = data.id ? true : false;
            const url = isEdit ? '/api/scheduled_expenses/update' : '/api/scheduled_expenses';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                await this.loadScheduledExpenses();
                const message = isEdit ? 'Gasto programado actualizado exitosamente' : 'Gasto programado agregado exitosamente';
                this.showNotification(message, 'success');
            } else {
                const errorData = await response.json();
                this.showNotification('Error guardando gasto programado: ' + (errorData.message || 'Error desconocido'), 'error');
            }
        } catch (e) {
            console.error('Error:', e);
            this.showNotification('Error de red al guardar gasto programado', 'error');
        }
    }

    async deleteScheduledExpense(id) {
        try {
            const response = await fetch('/api/scheduled_expenses/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (response.ok) {
                await this.loadScheduledExpenses();
                this.showNotification('Gasto programado eliminado exitosamente', 'success');
            } else {
                alert('Error eliminando gasto programado');
            }
        } catch (e) {
            alert('Error de red');
        }
    }

    async loadData() {
        try {
            // Cargar categorías
            const categoriesResponse = await fetch('/api/categories');
            if (categoriesResponse.ok) {
                this.categories = await categoriesResponse.json();
            } else {
                console.log('Backend no disponible, usando datos de ejemplo');
                this.categories = this.getDefaultCategories();
            }
            
            // Cargar transacciones
            const transactionsResponse = await fetch('/api/transactions');
            if (transactionsResponse.ok) {
                this.transactions = await transactionsResponse.json();
            } else {
                console.log('Backend no disponible, usando datos de ejemplo');
                this.transactions = this.getDefaultTransactions();
            }
            
            console.log('Datos cargados:', { categories: this.categories, transactions: this.transactions });
        } catch (error) {
            console.error('Error cargando datos:', error);
            console.log('Usando datos de ejemplo');
            this.categories = this.getDefaultCategories();
            this.transactions = this.getDefaultTransactions();
        }
    }

    getDefaultCategories() {
        return [
            { id: 1, name: 'Alimentación', type: 'expense', color: '#dc3545', icon: 'fas fa-utensils' },
            { id: 2, name: 'Transporte', type: 'expense', color: '#fd7e14', icon: 'fas fa-car' },
            { id: 3, name: 'Salario', type: 'income', color: '#28a745', icon: 'fas fa-money-bill-wave' },
            { id: 4, name: 'Freelance', type: 'income', color: '#17a2b8', icon: 'fas fa-laptop-code' }
        ];
    }

    getDefaultTransactions() {
        return [
            { id: 1, description: 'Salario mensual', amount: 5000, type: 'income', category_id: 3, date: '2025-08-01', category_name: 'Salario', category_color: '#28a745' },
            { id: 2, description: 'Supermercado', amount: 150, type: 'expense', category_id: 1, date: '2025-08-01', category_name: 'Alimentación', category_color: '#dc3545' },
            { id: 3, description: 'Gasolina', amount: 80, type: 'expense', category_id: 2, date: '2025-08-01', category_name: 'Transporte', category_color: '#fd7e14' }
        ];
    }

    setupEventListeners() {
        // Botón de menú hamburguesa
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('active');
                }
            });
        }

        // Cerrar sidebar al hacer clic en un elemento de navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
                
                // Cerrar sidebar en móviles
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });

        // Cerrar sidebar al hacer clic fuera de él en móviles
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const menuToggle = document.getElementById('menu-toggle');
            
            if (sidebar && window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });

        // Cerrar modales al hacer clic en el overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });

        // Botones de acción
        const addTransactionBtn = document.getElementById('add-transaction-btn');
        if (addTransactionBtn) {
            addTransactionBtn.addEventListener('click', () => {
                this.showTransactionModal();
            });
        }

        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        // Formularios
        const transactionForm = document.getElementById('transaction-form');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTransaction();
            });
        }

        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCategory();
            });
        }

        // Cerrar modales - AGREGADO NUEVO
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Cerrar modales al hacer clic fuera - AGREGADO NUEVO
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Cerrar con Escape - AGREGADO NUEVO
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Botones de cancelar - AGREGADO NUEVO
        const cancelTransactionBtn = document.getElementById('cancel-transaction');
        if (cancelTransactionBtn) {
            cancelTransactionBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        const cancelCategoryBtn = document.getElementById('cancel-category');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        // Filtros
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.filterTransactions();
            });
        }

        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => {
                this.filterTransactions();
            });
        }

        // Botón de respaldo
        const backupBtn = document.getElementById('backup-db');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => {
                this.backupDatabase();
            });
        }

        // Botón de exportar
        const exportBtn = document.getElementById('export-db');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDatabase();
            });
        }

        // Botón de importar
        const importBtn = document.getElementById('import-db');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-file').click();
            });
        }

        // Input de archivo para importar
        const importFile = document.getElementById('import-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImportFile(e.target.files[0]);
                }
            });
        }

        // Botones del modal de importación
        const importReplace = document.getElementById('import-replace');
        if (importReplace) {
            importReplace.addEventListener('click', () => {
                this.confirmImport('replace');
            });
        }

        const importMerge = document.getElementById('import-merge');
        if (importMerge) {
            importMerge.addEventListener('click', () => {
                this.confirmImport('merge');
            });
        }

        const cancelImport = document.getElementById('cancel-import');
        if (cancelImport) {
            cancelImport.addEventListener('click', () => {
                this.closeModals();
                this.pendingImportData = null;
            });
        }
    }

    switchSection(section) {
        console.log('Cambiando a sección:', section);
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });

        // Mostrar sección seleccionada
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Sección mostrada:', section);
        } else {
            console.log('Sección no encontrada:', `${section}-section`);
        }

        // Actualizar navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeNav = document.querySelector(`[data-section="${section}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }

        // Actualizar título de la página
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            const titles = {
                'dashboard': '🏠 Hogar Gatuno',
                'transactions': '🐾 Huellas Financieras',
                'categories': '💖 Categorías Gatunas',
                'reports': '⭐ Reportes Gatunos',
                'scheduled': '💸 Membresías y Programados',
                'settings': '👑 Configuración Real'
            };
            pageTitle.textContent = titles[section] || '🐱 Finanzas Gatunas';
        }

        this.currentSection = section;

        // Actualizar contenido según la sección
        switch (section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'transactions':
                this.loadTransactionsTable();
                break;
            case 'categories':
                // Solo cargar datos de gastos programados sin interfaz
                this.loadScheduledExpensesDataOnly();
                setTimeout(() => {
                    this.loadCategoriesGrid();
                }, 100);
                break;
            case 'reports':
                this.updateCharts();
                break;
            case 'scheduled':
                console.log('Entrando a sección scheduled');
                this.loadScheduledExpenses();
                // Asegurar que el botón se configure cuando cambiamos a esta sección
                setTimeout(() => {
                    this.setupScheduledEvents();
                    console.log('Eventos de sección scheduled configurados');
                }, 100);
                break;
        }
    }

    async updateDashboard() {
        try {
            const response = await fetch('/api/dashboard');
            if (response.ok) {
                const stats = await response.json();
                
                // Actualizar estadísticas
                this.updateElement('total-income', this.formatCurrency(stats.total_income));
                this.updateElement('total-expenses', this.formatCurrency(stats.total_expenses));
                this.updateElement('balance', this.formatCurrency(stats.balance));
                
                // Actualizar transacciones recientes
                this.updateRecentTransactions(stats.recent_transactions);
            } else {
                // Usar datos locales
                const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const totalExpenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const balance = totalIncome - totalExpenses;
                
                this.updateElement('total-income', this.formatCurrency(totalIncome));
                this.updateElement('total-expenses', this.formatCurrency(totalExpenses));
                this.updateElement('balance', this.formatCurrency(balance));
                
                this.updateRecentTransactions(this.transactions.slice(0, 5));
            }
            
            // Actualizar gráficos
            this.updateCharts();
        } catch (error) {
            console.error('Error actualizando dashboard:', error);
            // Usar datos locales como fallback
            const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const balance = totalIncome - totalExpenses;
            
            this.updateElement('total-income', this.formatCurrency(totalIncome));
            this.updateElement('total-expenses', this.formatCurrency(totalExpenses));
            this.updateElement('balance', this.formatCurrency(balance));
            
            this.updateRecentTransactions(this.transactions.slice(0, 5));
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateRecentTransactions(transactions) {
        const container = document.getElementById('recent-transactions-list');
        if (!container) return;
        
        container.innerHTML = '';

        if (transactions.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay transacciones recientes</p>';
            return;
        }

        transactions.forEach(transaction => {
            const item = document.createElement('div');
            item.className = 'transaction-item';
            item.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-category" style="color: ${transaction.category_color || '#007bff'}">
                        ${transaction.category_name || 'Sin categoría'}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </div>
            `;
            container.appendChild(item);
        });
    }

    loadTransactionsTable() {
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        this.transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category_name || 'Sin categoría'}</td>
                <td class="${transaction.type}">${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                <td class="${transaction.type}">${this.formatCurrency(transaction.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    loadCategoriesGrid() {
        const container = document.getElementById('categories-grid');
        if (!container) return;
        
        container.innerHTML = '';

        // Agregar solo las categorías normales
        this.categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div class="category-icon" style="background: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <span class="category-type ${category.type}">${category.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
                </div>
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateCharts() {
        // Verificar si Chart.js está disponible
        if (typeof Chart === 'undefined') {
            console.log('Chart.js no está disponible');
            return;
        }

        // Gráfico de ingresos vs gastos
        const incomeData = this.transactions.filter(t => t.type === 'income');
        const expenseData = this.transactions.filter(t => t.type === 'expense');
        
        const totalIncome = incomeData.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = expenseData.reduce((sum, t) => sum + t.amount, 0);

        // Actualizar gráfico circular
        const expenseChartCanvas = document.getElementById('expense-chart');
        if (expenseChartCanvas) {
            if (window.expenseChart) {
                window.expenseChart.destroy();
            }
            
            window.expenseChart = new Chart(expenseChartCanvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Ingresos', 'Gastos'],
                    datasets: [{
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ['#28a745', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Gráfico de flujo de efectivo
        const cashflowChartCanvas = document.getElementById('cashflow-chart');
        if (cashflowChartCanvas) {
            if (window.cashflowChart) {
                window.cashflowChart.destroy();
            }

            // Datos de los últimos 6 meses
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
            const incomeData = [5000, 5200, 4800, 5500, 5100, 5300];
            const expenseData = [3200, 3400, 3100, 3600, 3300, 3500];

            window.cashflowChart = new Chart(cashflowChartCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: incomeData,
                            borderColor: '#28a745',
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            tension: 0.4
                        },
                        {
                            label: 'Gastos',
                            data: expenseData,
                            borderColor: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    showTransactionModal(transaction = null) {
        const modal = document.getElementById('transaction-modal');
        if (!modal) {
            console.log('Modal de transacción no encontrado');
            return;
        }
        
        const form = document.getElementById('transaction-form');
        if (!form) {
            console.log('Formulario de transacción no encontrado');
            return;
        }
        
        if (transaction) {
            // Modo edición
            form.querySelector('#transaction-description').value = transaction.description;
            form.querySelector('#transaction-amount').value = transaction.amount;
            form.querySelector('#transaction-type').value = transaction.type;
            form.querySelector('#transaction-category').value = transaction.category_id || '';
            form.querySelector('#transaction-date').value = transaction.date;
            form.querySelector('#transaction-notes').value = transaction.notes || '';
            form.dataset.editId = transaction.id;
            
            // Actualizar título del modal
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) {
                modalTitle.textContent = '🐱 Editar Huella Financiera';
            }
        } else {
            // Modo creación
            form.reset();
            form.querySelector('#transaction-date').value = new Date().toISOString().split('T')[0];
            delete form.dataset.editId;
            
            // Actualizar título del modal
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) {
                modalTitle.textContent = '🐱 Nueva Huella Financiera';
            }
        }

        this.populateCategorySelect();
        modal.style.display = 'block';
    }

    showCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        if (!modal) {
            console.log('Modal de categoría no encontrado');
            return;
        }
        
        const form = document.getElementById('category-form');
        if (!form) {
            console.log('Formulario de categoría no encontrado');
            return;
        }
        
        if (category) {
            // Modo edición
            form.querySelector('#category-name').value = category.name;
            form.querySelector('#category-color').value = category.color;
            form.querySelector('#category-icon').value = category.icon.replace('fas fa-', '');
            form.dataset.editId = category.id;
            
            // Actualizar título del modal
            const modalTitle = modal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = '💖 Editar Categoría Gatuna';
            }
        } else {
            // Modo creación
            form.reset();
            delete form.dataset.editId;
            
            // Actualizar título del modal
            const modalTitle = modal.querySelector('h2');
            if (modalTitle) {
                modalTitle.textContent = '💖 Nueva Categoría Gatuna';
            }
        }

        modal.style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    populateCategorySelect() {
        const select = document.getElementById('transaction-category');
        if (!select) return;
        
        select.innerHTML = '<option value="">Seleccionar categoría</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    async saveTransaction() {
        const form = document.getElementById('transaction-form');
        if (!form) return;
        
        const formData = new FormData(form);
        
        const transactionData = {
            description: formData.get('description') || form.querySelector('#transaction-description').value,
            amount: parseFloat(formData.get('amount') || form.querySelector('#transaction-amount').value),
            type: formData.get('type') || form.querySelector('#transaction-type').value,
            category_id: formData.get('category') || form.querySelector('#transaction-category').value || null,
            date: formData.get('date') || form.querySelector('#transaction-date').value,
            notes: formData.get('notes') || form.querySelector('#transaction-notes').value
        };

        if (form.dataset.editId) {
            transactionData.id = parseInt(form.dataset.editId);
        }

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.showNotification('Transacción guardada exitosamente', 'success');
                    this.closeModals();
                    await this.loadData();
                    this.updateDashboard();
                    if (this.currentSection === 'transactions') {
                        this.loadTransactionsTable();
                    }
                }
            } else {
                // Simular guardado local
                const newTransaction = {
                    id: Date.now(),
                    ...transactionData,
                    category_name: this.categories.find(c => c.id == transactionData.category_id)?.name || 'Sin categoría',
                    category_color: this.categories.find(c => c.id == transactionData.category_id)?.color || '#007bff'
                };
                
                if (form.dataset.editId) {
                    const index = this.transactions.findIndex(t => t.id == form.dataset.editId);
                    if (index !== -1) {
                        this.transactions[index] = newTransaction;
                    }
                } else {
                    this.transactions.unshift(newTransaction);
                }
                
                this.showNotification('Transacción guardada localmente', 'success');
                this.closeModals();
                this.updateDashboard();
                if (this.currentSection === 'transactions') {
                    this.loadTransactionsTable();
                }
            }
        } catch (error) {
            console.error('Error guardando transacción:', error);
            this.showNotification('Error guardando transacción', 'error');
        }
    }

    async saveCategory() {
        const form = document.getElementById('category-form');
        if (!form) return;
        
        const formData = new FormData(form);
        
        const categoryData = {
            name: formData.get('name') || form.querySelector('#category-name').value,
            type: 'expense', // Por defecto
            color: formData.get('color') || form.querySelector('#category-color').value,
            icon: 'fas fa-' + (formData.get('icon') || form.querySelector('#category-icon').value)
        };

        if (form.dataset.editId) {
            categoryData.id = parseInt(form.dataset.editId);
        }

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.showNotification('Categoría guardada exitosamente', 'success');
                    this.closeModals();
                    await this.loadData();
                    if (this.currentSection === 'categories') {
                        this.loadCategoriesGrid();
                    }
                }
            } else {
                // Simular guardado local
                const newCategory = {
                    id: Date.now(),
                    ...categoryData
                };
                
                if (form.dataset.editId) {
                    const index = this.categories.findIndex(c => c.id == form.dataset.editId);
                    if (index !== -1) {
                        this.categories[index] = newCategory;
                    }
                } else {
                    this.categories.push(newCategory);
                }
                
                this.showNotification('Categoría guardada localmente', 'success');
                this.closeModals();
                if (this.currentSection === 'categories') {
                    this.loadCategoriesGrid();
                }
            }
        } catch (error) {
            console.error('Error guardando categoría:', error);
            this.showNotification('Error guardando categoría', 'error');
        }
    }

    async deleteTransaction(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            return;
        }

        try {
            const response = await fetch('/api/transactions/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.showNotification('Transacción eliminada exitosamente', 'success');
                    await this.loadData();
                    this.updateDashboard();
                    if (this.currentSection === 'transactions') {
                        this.loadTransactionsTable();
                    }
                }
            } else {
                // Eliminar localmente
                this.transactions = this.transactions.filter(t => t.id !== id);
                this.showNotification('Transacción eliminada localmente', 'success');
                this.updateDashboard();
                if (this.currentSection === 'transactions') {
                    this.loadTransactionsTable();
                }
            }
        } catch (error) {
            console.error('Error eliminando transacción:', error);
            this.showNotification('Error eliminando transacción', 'error');
        }
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (transaction) {
            this.showTransactionModal(transaction);
        }
    }

    editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            this.showCategoryModal(category);
        }
    }

    viewScheduledDetails(id) {
        const expense = this.scheduledExpenses.find(e => e.id === id);
        if (expense) {
            const details = `
📋 Descripción: ${expense.description}
💰 Monto: ${this.formatCurrency(expense.amount)}
🔄 Frecuencia: ${expense.frequency}
📅 Próximo pago: ${expense.next_payment}
📝 Notas: ${expense.notes || 'Sin notas'}
            `;
            alert(details);
        }
    }

    filterTransactions() {
        const dateFilter = document.getElementById('date-filter');
        const typeFilter = document.getElementById('type-filter');
        
        if (!dateFilter || !typeFilter) return;

        let filteredTransactions = this.transactions;

        if (dateFilter.value) {
            filteredTransactions = filteredTransactions.filter(t => t.date === dateFilter.value);
        }

        if (typeFilter.value) {
            filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter.value);
        }

        // Actualizar tabla con transacciones filtradas
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category_name || 'Sin categoría'}</td>
                <td class="${transaction.type}">${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
                <td class="${transaction.type}">${this.formatCurrency(transaction.amount)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-MX');
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Mostrar
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async exportDatabase() {
        try {
            this.showNotification('Exportando base de datos...', 'info');
            
            const response = await fetch('/api/export_database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    // Crear archivo para descarga
                    const dataStr = JSON.stringify(result.data, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    // Crear elemento de descarga
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `finanzas_gatunas_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    this.showNotification(
                        `✅ Base de datos exportada exitosamente!\n📊 ${result.stats.categories} categorías, ${result.stats.transactions} transacciones, ${result.stats.scheduled_expenses} gastos programados`, 
                        'success'
                    );
                } else {
                    this.showNotification(`❌ Error exportando: ${result.error}`, 'error');
                }
            } else {
                this.showNotification('❌ Error conectando con el servidor', 'error');
            }
        } catch (error) {
            console.error('Error exportando base de datos:', error);
            this.showNotification('❌ Error exportando base de datos', 'error');
        }
    }

    async handleImportFile(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Validar estructura del archivo
            if (!importData.categories || !importData.transactions || !importData.scheduled_expenses) {
                this.showNotification('❌ Archivo de importación inválido', 'error');
                return;
            }

            // Mostrar estadísticas del archivo
            const stats = {
                categories: importData.categories.length,
                transactions: importData.transactions.length,
                scheduled_expenses: importData.scheduled_expenses.length
            };

            // Mostrar modal de confirmación
            const modal = document.getElementById('import-modal');
            const statsDiv = document.getElementById('import-stats');
            statsDiv.innerHTML = `
                <ul>
                    <li>📂 ${stats.categories} categorías</li>
                    <li>💳 ${stats.transactions} transacciones</li>
                    <li>📅 ${stats.scheduled_expenses} gastos programados</li>
                </ul>
            `;

            // Guardar datos para importación posterior
            this.pendingImportData = importData;
            modal.style.display = 'block';

        } catch (error) {
            console.error('Error leyendo archivo:', error);
            this.showNotification('❌ Error leyendo archivo de importación', 'error');
        }
    }

    async confirmImport(mode) {
        try {
            if (!this.pendingImportData) {
                this.showNotification('❌ No hay datos para importar', 'error');
                return;
            }

            this.showNotification(`${mode === 'replace' ? 'Reemplazando' : 'Fusionando'} base de datos...`, 'info');
            
            const response = await fetch('/api/import_database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: this.pendingImportData,
                    mode: mode
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                if (result.success) {
                    this.showNotification(
                        `✅ ${result.message}\n📊 ${result.stats.categories} categorías, ${result.stats.transactions} transacciones, ${result.stats.scheduled_expenses} gastos programados procesados`, 
                        'success'
                    );
                    
                    // Recargar datos y actualizar UI
                    await this.loadData();
                    this.updateDashboard();
                    if (this.currentSection === 'transactions') {
                        this.loadTransactionsTable();
                    } else if (this.currentSection === 'categories') {
                        this.loadCategoriesGrid();
                    } else if (this.currentSection === 'scheduled') {
                        this.loadScheduledExpenses();
                    }
                    
                } else {
                    this.showNotification(`❌ Error importando: ${result.error}`, 'error');
                }
            } else {
                this.showNotification('❌ Error conectando con el servidor', 'error');
            }

            // Limpiar y cerrar modal
            this.closeModals();
            this.pendingImportData = null;
            document.getElementById('import-file').value = '';

        } catch (error) {
            console.error('Error importando base de datos:', error);
            this.showNotification('❌ Error importando base de datos', 'error');
        }
    }

    async backupDatabase() {
        try {
            this.showNotification('Creando respaldo...', 'info');
            
            const response = await fetch('/api/backup');
            const result = await response.json();
            
            if (result.success) {
                this.showNotification(
                    `✅ Respaldo creado exitosamente!\n📁 ${result.filename}\n📊 ${result.stats.categories} categorías, ${result.stats.transactions} transacciones`, 
                    'success'
                );
            } else {
                this.showNotification(`❌ Error creando respaldo: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Error en respaldo:', error);
            this.showNotification('❌ Error creando respaldo', 'error');
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FinanceApp();
}); 