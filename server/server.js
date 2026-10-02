const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let commissions = [
  { 
    id: 1, 
    title: 'Meme', 
    client: 'IDK', 
    type: 'Freestyle', 
    price: 0, 
    status: 'Completed',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo0bx7oq0jtAZXGhVVHJ4r0RAL-T9fvC_MHxDWNwdv2mrLkMooFW13MGo&s=10'
  },
  { 
    id: 2, 
    title: 'Freestyle Art', 
    client: 'GamerX', 
    type: 'Freestyle', 
    price: 800, 
    status: 'In Progress',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80'
  },
  { 
    id: 3, 
    title: 'กบน่ารัก', 
    client: 'กบทรงพลัง', 
    type: 'Full Scale', 
    price: 900, 
    status: 'Pending',
    imageUrl: ''
  }
];
let currentId = 4;

app.get('/api/commissions', (req, res) => {
  let result = [...commissions];
  const { type, status } = req.query;

  if (type) result = result.filter(c => c.type.toLowerCase() === type.toLowerCase());
  if (status) result = result.filter(c => c.status.toLowerCase() === status.toLowerCase());

  res.json(result);
});

app.get('/api/commissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = commissions.find(c => c.id === id);

  if (!item) {
    return res.status(404).json({ error: 'ไม่พบรายการที่ระบุ (Commission not found)' });
  }

  res.json(item);
});

app.post('/api/commissions', (req, res) => {
  const { title, client, type, price, imageUrl } = req.body;

  if (!title || !client || !type || price === undefined) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูล title, client, type และ price ให้ครบถ้วน' });
  }

  const newItem = {
    id: currentId++,
    title: String(title).trim(),
    client: String(client).trim(),
    type: String(type).trim(),
    price: Number(price),
    status: 'Pending',
    imageUrl: imageUrl ? String(imageUrl).trim() : ''
  };

  commissions.push(newItem);
  res.status(201).json(newItem);
});

app.patch('/api/commissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = commissions.find(c => c.id === id);

  if (!item) {
    return res.status(404).json({ error: 'ไม่พบรายการที่ระบุ (Commission not found)' });
  }

  const { title, client, type, price, status, imageUrl } = req.body;

  if (title !== undefined) item.title = String(title).trim();
  if (client !== undefined) item.client = String(client).trim();
  if (type !== undefined) item.type = String(type).trim();
  if (price !== undefined) item.price = Number(price);
  if (status !== undefined) item.status = String(status).trim();
  if (imageUrl !== undefined) item.imageUrl = String(imageUrl).trim();

  res.json(item);
});

app.delete('/api/commissions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = commissions.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'ไม่พบรายการที่ระบุ (Commission not found)' });
  }

  commissions.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));