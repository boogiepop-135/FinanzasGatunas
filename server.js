const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'build')));

// Datos simulados (reemplazar con base de datos real)
let categories = [
  { id: 1, name: "🥩 Comida Gatuna", type: "expense" },
  { id: 2, name: "🩺 Veterinario", type: "expense" },
  { id: 3, name: "🎮 Entretenimiento", type: "expense" },
  { id: 4, name: "💼 Trabajo", type: "income" }
];

let transactions = [];
let scheduledExpenses = [];
let nextId = 5;

// API Routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const newCategory = {
    id: nextId++,
    name: req.body.name,
    type: req.body.type
  };
  categories.push(newCategory);
  res.json(newCategory);
});

app.delete('/api/categories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  categories = categories.filter(cat => cat.id !== id);
  res.json({ success: true });
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.post('/api/transactions', (req, res) => {
  const newTransaction = {
    id: nextId++,
    ...req.body,
    date: req.body.date || new Date().toISOString().split('T')[0]
  };
  transactions.push(newTransaction);
  res.json(newTransaction);
});

app.delete('/api/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  transactions = transactions.filter(trans => trans.id !== id);
  res.json({ success: true });
});

app.get('/api/scheduled-expenses', (req, res) => {
  res.json(scheduledExpenses);
});

app.post('/api/scheduled-expenses', (req, res) => {
  const newScheduledExpense = {
    id: nextId++,
    ...req.body
  };
  scheduledExpenses.push(newScheduledExpense);
  res.json(newScheduledExpense);
});

app.delete('/api/scheduled-expenses/:id', (req, res) => {
  const id = parseInt(req.params.id);
  scheduledExpenses = scheduledExpenses.filter(exp => exp.id !== id);
  res.json({ success: true });
});

app.post('/api/scheduled-expenses/:id/execute', (req, res) => {
  const id = parseInt(req.params.id);
  const scheduledExpense = scheduledExpenses.find(exp => exp.id === id);
  
  if (scheduledExpense) {
    // Crear transacción basada en el gasto programado
    const newTransaction = {
      id: nextId++,
      description: scheduledExpense.description,
      amount: scheduledExpense.amount,
      type: 'expense',
      category_id: scheduledExpense.category_id,
      date: new Date().toISOString().split('T')[0],
      notes: `Ejecutado automáticamente: ${scheduledExpense.notes || ''}`
    };
    
    transactions.push(newTransaction);
    
    // Actualizar fecha del próximo pago (simplificado - solo agregar 30 días)
    const nextDate = new Date(scheduledExpense.next_date);
    nextDate.setDate(nextDate.getDate() + 30);
    scheduledExpense.next_date = nextDate.toISOString().split('T')[0];
    
    res.json({ transaction: newTransaction, scheduledExpense });
  } else {
    res.status(404).json({ error: 'Gasto programado no encontrado' });
  }
});

// Catch all handler: enviar React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
  console.log('Presiona Ctrl+C para detener el servidor');
});

module.exports = app;
