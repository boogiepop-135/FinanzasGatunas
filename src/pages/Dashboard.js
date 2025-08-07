import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

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
      } else {
        setCategories([
          { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
          { id: 2, name: "🩺 Veterinario", type: "expense" },
          { id: 3, name: "🎮 Entretenimiento", type: "expense" },
          { id: 4, name: "💼 Trabajo", type: "income" }
        ]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>🏠 Dashboard Gatuno</h2>
      </div>

      <div className="dashboard-cards">
        <div className="card income-card">
          <h3>💰 Ingresos Totales</h3>
          <p className="amount">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="card expense-card">
          <h3>💸 Gastos Totales</h3>
          <p className="amount">{formatCurrency(totalExpenses)}</p>
        </div>
        
        <div className="card balance-card">
          <h3>⚖️ Balance Actual</h3>
          <p className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="recent-transactions">
        <h3>🐾 Transacciones Recientes</h3>
        <div className="transactions-list">
          {transactions.slice(0, 5).map(transaction => {
            const category = categories.find(c => c.id === transaction.category_id);
            return (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <strong>{transaction.description}</strong>
                  <span className="category">{category ? category.name : 'Sin categoría'}</span>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
