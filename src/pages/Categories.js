import React, { useState, useEffect } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        // Categorías por defecto si hay error
        setCategories([
          { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
          { id: 2, name: "🩺 Veterinario", type: "expense" },
          { id: 3, name: "🎮 Entretenimiento", type: "expense" },
          { id: 4, name: "💼 Trabajo", type: "income" }
        ]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
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
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadCategories();
        setShowModal(false);
        setFormData({ name: '', type: 'expense' });
        showNotification('Categoría guardada exitosamente', 'success');
      } else {
        showNotification('Error al guardar la categoría', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadCategories();
        showNotification('Categoría eliminada exitosamente', 'success');
      } else {
        showNotification('Error al eliminar la categoría', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error de conexión', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Implementar notificaciones (opcional)
    alert(message);
  };

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>💖 Gestión de Categorías Gatunas</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <i className="fas fa-plus"></i> 💖 Nueva Categoría Gatuna
        </button>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>Tipo: {category.type === 'income' ? 'Ingreso' : 'Gasto'}</p>
            <div className="category-actions">
              <button 
                className="btn btn-sm btn-danger" 
                onClick={() => deleteCategory(category.id)}
              >
                <i className="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para nueva categoría */}
      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close" onClick={() => setShowModal(false)}>&times;</span>
            <h3>💖 Nueva Categoría Gatuna</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la categoría:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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

export default Categories;
