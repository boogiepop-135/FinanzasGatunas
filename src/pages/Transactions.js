import React, { useState, useEffect } from 'react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });


  // URL base para el backend
  const API_BASE = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      setTransactions([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/categories`);
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
      const response = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id)
        })
      });

      if (response.ok) {
        await loadTransactions();
        setShowModal(false);
        setFormData({
          description: '',
          amount: '',
          type: 'expense',
          category_id: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
        showNotification('Transacción guardada exitosamente', 'success');
      } else {
        showNotification('Error al guardar la transacción', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/transactions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadTransactions();
        showNotification('Transacción eliminada exitosamente', 'success');
      } else {
        showNotification('Error al eliminar la transacción', 'error');
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
    let csv = 'Descripción,Monto,Tipo,Categoría,Fecha,Notas\n';
    const filtered = getFilteredTransactions();

    filtered.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category_id);
      csv += `"${transaction.description.replace(/"/g, '""')}","${transaction.amount}","${transaction.type}","${category ? category.name : ''}","${transaction.date}","${transaction.notes ? transaction.notes.replace(/"/g, '""') : ''}"\n`;
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
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesCategory = !filterCategory || transaction.category_id.toString() === filterCategory;
      const matchesType = !filterType || transaction.type === filterType;
      const matchesDate = !filterDate || transaction.date === filterDate;
      return matchesCategory && matchesType && matchesDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>🐾 Gestión de Huellas Financieras</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i> Nueva Transacción
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
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
          
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
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
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => {
              const category = categories.find(c => c.id === transaction.category_id);
              return (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>
                    <div>
                      <strong>{transaction.description}</strong>
                      {transaction.notes && <div style={{fontSize: '0.8rem', color: '#666'}}>{transaction.notes}</div>}
                    </div>
                  </td>
                  <td>
                    {category && <div className="category-tag">{category.name}</div>}
                  </td>
                  <td>
                    <span className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className={transaction.type}>{formatCurrency(transaction.amount)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => deleteTransaction(transaction.id)}
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
        
        {filteredTransactions.length === 0 && (
          <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
            No hay transacciones para mostrar
          </div>
        )}
      </div>

      {/* Modal para nueva transacción */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
            <h3>🐾 Nueva Huella Financiera</h3>
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
                <label>Tipo:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
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
                <label>Fecha:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
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

export default Transactions;
