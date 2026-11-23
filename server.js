const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const ORDERS_FILE = path.join(__dirname, 'orders.json');

app.use(express.json());
app.use(express.static(__dirname));

function readOrders(){ try { return JSON.parse(fs.readFileSync(ORDERS_FILE)); } catch { return []; } }
function writeOrders(orders){ fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2)); }

// list products (kept server-side too, mirrors data.js — optional to use from frontend)
app.get('/api/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'data.js')); // simple: frontend already has this; endpoint kept for future backend-driven catalog
});

// create order
app.post('/api/orders', (req, res) => {
  const orders = readOrders();
  const order = {
    id: 'LP' + Date.now(),
    ...req.body,
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  writeOrders(orders);
  res.status(201).json(order);
});

// fetch one order (used by order-placed.html)
app.get('/api/orders/:id', (req, res) => {
  const order = readOrders().find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// list all orders (basic admin view)
app.get('/api/orders', (req, res) => res.json(readOrders()));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Mana Sarees backend running on http://localhost:${PORT}`));
