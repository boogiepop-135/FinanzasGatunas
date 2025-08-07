import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate = new Date();

    switch (reportPeriod) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const matchesPeriod = transactionDate >= startDate;
      const matchesCategory = !selectedCategory || transaction.category_id.toString() === selectedCategory;
      return matchesPeriod && matchesCategory;
    });
  };

  const filteredTransactions = getFilteredTransactions();
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = categories.map(category => {
    const categoryExpenses = filteredTransactions
      .filter(t => t.type === 'expense' && t.category_id === category.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      ...category,
      amount: categoryExpenses,
      percentage: totalExpenses > 0 ? (categoryExpenses / totalExpenses * 100).toFixed(1) : 0
    };
  }).filter(cat => cat.amount > 0);

  const incomeByCategory = categories.map(category => {
    const categoryIncome = filteredTransactions
      .filter(t => t.type === 'income' && t.category_id === category.id)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      ...category,
      amount: categoryIncome,
      percentage: totalIncome > 0 ? (categoryIncome / totalIncome * 100).toFixed(1) : 0
    };
  }).filter(cat => cat.amount > 0);

  const exportReport = () => {
    let csv = 'Reporte Financiero Gatuno\n';
    csv += `Período: ${reportPeriod === 'month' ? 'Último mes' : reportPeriod === 'quarter' ? 'Último trimestre' : 'Último año'}\n`;
    csv += `Fecha de generación: ${new Date().toLocaleDateString()}\n\n`;
    
    csv += 'RESUMEN GENERAL\n';
    csv += `Total Ingresos,${totalIncome}\n`;
    csv += `Total Gastos,${totalExpenses}\n`;
    csv += `Balance,${balance}\n\n`;
    
    csv += 'GASTOS POR CATEGORÍA\n';
    csv += 'Categoría,Monto,Porcentaje\n';
    expensesByCategory.forEach(cat => {
      csv += `"${cat.name}","${cat.amount}","${cat.percentage}%"\n`;
    });
    
    csv += '\nINGRESOS POR CATEGORÍA\n';
    csv += 'Categoría,Monto,Porcentaje\n';
    incomeByCategory.forEach(cat => {
      csv += `"${cat.name}","${cat.amount}","${cat.percentage}%"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_financiero_gatuno.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content">
      <div className="section-header">
        <h2>⭐ Reportes Financieros Gatunos</h2>
        <div className="report-controls">
          <select 
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
          >
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
          </select>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={exportReport}>
            <i className="fas fa-download"></i> Exportar
          </button>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card income-card">
          <h3>💰 Ingresos Totales</h3>
          <p className="amount positive">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="card expense-card">
          <h3>💸 Gastos Totales</h3>
          <p className="amount negative">{formatCurrency(totalExpenses)}</p>
        </div>
        
        <div className="card balance-card">
          <h3>⚖️ Balance</h3>
          <p className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px'}}>
        {/* Gastos por categoría */}
        <div className="report-card">
          <h3>📊 Gastos por Categoría</h3>
          <div className="category-breakdown">
            {expensesByCategory.length > 0 ? (
              expensesByCategory.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <span>{category.name}</span>
                    <span>{formatCurrency(category.amount)} ({category.percentage}%)</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill expense" 
                      style={{width: `${category.percentage}%`}}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', color: '#666'}}>No hay gastos en este período</p>
            )}
          </div>
        </div>

        {/* Ingresos por categoría */}
        <div className="report-card">
          <h3>💰 Ingresos por Categoría</h3>
          <div className="category-breakdown">
            {incomeByCategory.length > 0 ? (
              incomeByCategory.map(category => (
                <div key={category.id} className="category-item">
                  <div className="category-info">
                    <span>{category.name}</span>
                    <span>{formatCurrency(category.amount)} ({category.percentage}%)</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill income" 
                      style={{width: `${category.percentage}%`}}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{textAlign: 'center', color: '#666'}}>No hay ingresos en este período</p>
            )}
          </div>
        </div>
      </div>

      {/* Transacciones recientes del período */}
      <div className="recent-transactions">
        <h3>🐾 Transacciones del Período</h3>
        <div className="table-container">
          <table className="scheduled-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 10).map(transaction => {
                const category = categories.find(c => c.id === transaction.category_id);
                return (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td>
                      {category && <div className="category-tag">{category.name}</div>}
                    </td>
                    <td>
                      <span className={`transaction-type ${transaction.type}`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className={transaction.type}>{formatCurrency(transaction.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px', color: '#666'}}>
              No hay transacciones en este período
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
