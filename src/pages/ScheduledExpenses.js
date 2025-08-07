import React, { useState, useEffect } from 'react';

const ScheduledExpenses = () => {
  const [scheduledExpenses, setScheduledExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    frequency: 'monthly',
    next_date: '',
    notes: ''
  });

  useEffect(() => {
    loadScheduledExpenses();
    loadCategories();
  }, []);

  const loadScheduledExpenses = async () => {
    try {
      const response = await fetch('/api/scheduled-expenses');
      if (response.ok) {
        const data = await response.json();
        setScheduledExpenses(data);
      } else {
        setScheduledExpenses([]);
      }
    } catch (error) {
      console.error('Error cargando gastos programados:', error);
      setScheduledExpenses([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setCategories([
          { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
          { id: 2, name: "🩺 Veterinario", type: "expense" },
          { id: 3, name: "🎮 Entretenimiento", type: "expense" },
          { id: 4, name: "💼 Trabajo", type: "income" }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setCategories([
        { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
        { id: 2, name: "🩺 Veterinario", type: "expense" },
        { id: 3, name: "🎮 Entretenimiento", type: "expense" },
        { id: 4, name: "💼 Trabajo", type: "income" }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/scheduled-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id)
        })
      });

      if (response.ok) {
        await loadScheduledExpenses();
        setShowModal(false);
        setFormData({
          description: '',
          amount: '',
          category_id: '',
          frequency: 'monthly',
          next_date: '',
          notes: ''
        });
        showNotification('Gasto programado guardado exitosamente', 'success');
      } else {
        showNotification('Error al guardar el gasto programado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const deleteScheduledExpense = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este gasto programado?')) return;

    try {
      const response = await fetch(`/api/scheduled-expenses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadScheduledExpenses();
        showNotification('Gasto programado eliminado exitosamente', 'success');
      } else {
        showNotification('Error al eliminar el gasto programado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const executeScheduledExpense = async (id) => {
    if (!window.confirm('¿Ejecutar este gasto programado ahora?')) return;

    try {
      const response = await fetch(`/api/scheduled-expenses/${id}/execute`, { method: 'POST' });
      if (response.ok) {
        await loadScheduledExpenses();
        showNotification('Gasto programado ejecutado exitosamente', 'success');
      } else {
        showNotification('Error al ejecutar el gasto programado', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const showNotification = (message, type) => {
    alert(message);
  };

  const exportToExcel = () => {
    let csv = 'Descripción,Categoría,Monto,Frecuencia,Próximo Pago,Notas\n';
    const filtered = scheduledExpenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !filterCategory || expense.category_id.toString() === filterCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.forEach(expense => {
      const category = categories.find(c => c.id === expense.category_id);
      csv += `"${expense.description.replace(/"/g, '""')}","${category ? category.name : ''}","${expense.amount}","${expense.frequency}","${expense.next_date}","${expense.notes ? expense.notes.replace(/"/g, '""') : ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gastos_programados.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredExpenses = scheduledExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || expense.category_id.toString() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>💸 Membresías y Gastos Programados</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i> Nuevo Gasto Programado
        </button>
      </div>

      <div className="filters-section">
        <div className="filters">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Buscar descripción o nota..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <button className="btn btn-secondary" onClick={exportToExcel}>
            <i className="fas fa-download"></i> Exportar Excel
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="scheduled-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Frecuencia</th>
              <th>Próximo Pago</th>
              <th>Notas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => {
              const category = categories.find(c => c.id === expense.category_id);
              return (
                <tr key={expense.id}>
                  <td>
                    <div>
                      <strong>{expense.description}</strong>
                      {category && <div className="category-tag">{category.name}</div>}
                    </div>
                  </td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>{expense.frequency}</td>
                  <td>{expense.next_date}</td>
                  <td>{expense.notes}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-success" 
                      onClick={() => executeScheduledExpense(expense.id)}
                      title="Ejecutar ahora"
                    >
                      <i className="fas fa-play"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => deleteScheduledExpense(expense.id)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal para nuevo gasto programado */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
            <h3>💸 Nuevo Gasto Programado</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Descripción:</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Monto:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Categoría:</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Frecuencia:</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Próximo pago:</label>
                <input
                  type="date"
                  value={formData.next_date}
                  onChange={(e) => setFormData({...formData, next_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Notas:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledExpenses;
