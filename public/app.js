const API_URL = '/api/commissions';
const DEFAULT_IMAGE = 'https://placehold.co/500x300/f8fafc/94a3b8?text=No+Image';

document.addEventListener('DOMContentLoaded', () => {
  fetchCommissions();

  const addForm = document.getElementById('add-form');
  if (addForm) {
    addForm.addEventListener('submit', handleAddCommission);
  }

  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', handleUpdateCommission);
  }

  const filterType = document.getElementById('filter-type');
  if (filterType) {
    filterType.addEventListener('change', (e) => fetchCommissions(e.target.value));
  }

  const editImageUrlInput = document.getElementById('edit-imageUrl');
  if (editImageUrlInput) {
    editImageUrlInput.addEventListener('input', (e) => {
      updateModalImgPreview(e.target.value);
    });
  }
});

async function fetchCommissions(type = '') {
  try {
    let url = API_URL;
    if (type) url += `?type=${encodeURIComponent(type)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP Error');
    
    const data = await res.json();
    renderCommissions(data);
    updateDashboard(data);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

function updateDashboard(items) {
  const total = items.length;
  const completed = items.filter(i => i.status === 'Completed').length;
  const income = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const statTotal = document.getElementById('stat-total');
  const statCompleted = document.getElementById('stat-completed');
  const statIncome = document.getElementById('stat-income');

  if (statTotal) statTotal.innerText = total;
  if (statCompleted) statCompleted.innerText = completed;
  if (statIncome) statIncome.innerText = `฿${income.toLocaleString()}`;
}

function renderCommissions(items) {
  const listEl = document.getElementById('commission-list');
  if (!listEl) return;
  
  listEl.innerHTML = '';

  if (items.length === 0) {
    listEl.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#64748b; padding: 30px;">ไม่มีรายการข้อมูล</p>';
    return;
  }

  items.forEach(item => {
    const imgSrc = item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : DEFAULT_IMAGE;
    const statusClean = item.status.replace(/\s+/g, '-');

    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-img-box">
        <img src="${escapeHtml(imgSrc)}" class="item-img" alt="preview" onerror="this.src='${DEFAULT_IMAGE}'">
      </div>
      <div class="item-content">
        <div class="item-badges">
          <span class="badge badge-type">${escapeHtml(item.type)}</span>
          <span class="badge badge-${statusClean}">${escapeHtml(item.status)}</span>
        </div>
        <div class="item-name">${escapeHtml(item.title)}</div>
        <div class="item-client">ลูกค้า: ${escapeHtml(item.client)}</div>
        <div class="item-footer">
          <span class="item-price">฿${Number(item.price).toLocaleString()}</span>
          <div class="item-actions">
            <button class="btn btn-sm" onclick="openEditModal(${item.id})">แก้ไข</button>
            <button class="btn btn-sm" onclick="toggleStatus(${item.id}, '${item.status}')">สลับสถานะ</button>
            <button class="btn btn-danger-sm" onclick="deleteCommission(${item.id})">ลบ</button>
          </div>
        </div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

async function handleAddCommission(e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const client = document.getElementById('client').value;
  const type = document.getElementById('type').value;
  const price = document.getElementById('price').value;
  const imageUrl = document.getElementById('imageUrl').value;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, client, type, price, imageUrl })
    });

    if (res.ok) {
      document.getElementById('add-form').reset();
      const currentFilter = document.getElementById('filter-type').value;
      fetchCommissions(currentFilter);
    }
  } catch (err) {
    console.error('Error adding item:', err);
  }
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Not found');
    const item = await res.json();

    document.getElementById('edit-id').value = item.id;
    document.getElementById('edit-title').value = item.title;
    document.getElementById('edit-price').value = item.price;
    
    const url = item.imageUrl || '';
    document.getElementById('edit-imageUrl').value = url;
    updateModalImgPreview(url);

    document.getElementById('edit-modal').classList.remove('hidden');
  } catch (err) {
    console.error('Error opening modal:', err);
  }
}

function updateModalImgPreview(url) {
  const imgEl = document.getElementById('modal-img-preview');
  if (url && url.trim() !== '') {
    imgEl.src = url;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }
}

function closeModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

async function handleUpdateCommission(e) {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const title = document.getElementById('edit-title').value;
  const price = document.getElementById('edit-price').value;
  const imageUrl = document.getElementById('edit-imageUrl').value;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        price: Number(price),
        imageUrl
      })
    });

    if (res.ok) {
      closeModal();
      const currentFilter = document.getElementById('filter-type').value;
      fetchCommissions(currentFilter);
    }
  } catch (err) {
    console.error('Error updating item:', err);
  }
}

async function toggleStatus(id, currentStatus) {
  const statusFlow = {
    'Pending': 'In Progress',
    'In Progress': 'Completed',
    'Completed': 'Pending'
  };

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: statusFlow[currentStatus] || 'Pending' })
    });

    if (res.ok) {
      const currentFilter = document.getElementById('filter-type').value;
      fetchCommissions(currentFilter);
    }
  } catch (err) {
    console.error('Error updating status:', err);
  }
}

async function deleteCommission(id) {
  if (!confirm('ต้องการลบรายการนี้หรือไม่?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      const currentFilter = document.getElementById('filter-type').value;
      fetchCommissions(currentFilter);
    }
  } catch (err) {
    console.error('Error deleting item:', err);
  }
}

function escapeHtml(text) {
  return text ? String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : '';
}