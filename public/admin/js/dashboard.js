/**
 * Admin Dashboard
 */

let siteContent = {};
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.success) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = data.user;
    document.getElementById('adminUsername').textContent = currentUser.username;
  } catch {
    window.location.href = 'index.html';
    return;
  }

  // Load content
  await loadContent();

  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      showSection(section);
      document.querySelectorAll('.sidebar-nav a').forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = 'index.html';
  });

  // Load contacts
  loadContacts();
  loadProducts();
  loadReviews();
});

async function loadContent() {
  try {
    const res = await fetch('/api/content');
    const data = await res.json();
    if (data.success) {
      siteContent = data.content;
      populateAllForms();
      updateOverviewStats();
    }
  } catch (err) {
    showMessage('Failed to load content.', 'error');
  }
}

function populateAllForms() {
  // Hero
  if (siteContent.hero) {
    document.getElementById('hero-title').value = siteContent.hero.title || '';
    document.getElementById('hero-subtitle').value = siteContent.hero.subtitle || '';
    document.getElementById('hero-primaryButton').value = siteContent.hero.primaryButton || '';
    document.getElementById('hero-secondaryButton').value = siteContent.hero.secondaryButton || '';
  }

  // Services
  if (siteContent.services) {
    document.getElementById('services-tag').value = siteContent.services.tag || '';
    document.getElementById('services-title').value = siteContent.services.title || '';
    document.getElementById('services-description').value = siteContent.services.description || '';
    renderItemsEditor('services-items', siteContent.services.items || [], 'services');
  }

  // Gallery
  if (siteContent.gallery) {
    document.getElementById('gallery-tag').value = siteContent.gallery.tag || '';
    document.getElementById('gallery-title').value = siteContent.gallery.title || '';
    document.getElementById('gallery-description').value = siteContent.gallery.description || '';
    renderItemsEditor('gallery-items', siteContent.gallery.items || [], 'gallery');
  }

  // About
  if (siteContent.about) {
    document.getElementById('about-tag').value = siteContent.about.tag || '';
    document.getElementById('about-title').value = siteContent.about.title || '';
    document.getElementById('about-description').value = siteContent.about.description || '';
    document.getElementById('about-description2').value = siteContent.about.description2 || '';
    document.getElementById('about-image').value = siteContent.about.image || '';
    document.getElementById('about-experience-number').value = siteContent.about.experience?.number || '';
    document.getElementById('about-experience-text').value = siteContent.about.experience?.text || '';
    renderFeaturesEditor();
  }

  // Stats
  if (siteContent.stats) {
    renderStatsEditor();
  }

  // Contact
  if (siteContent.contact) {
    document.getElementById('contact-tag').value = siteContent.contact.tag || '';
    document.getElementById('contact-title').value = siteContent.contact.title || '';
    document.getElementById('contact-description').value = siteContent.contact.description || '';
    document.getElementById('contact-address').value = siteContent.contact.info?.address || '';
    document.getElementById('contact-phone').value = siteContent.contact.info?.phone || '';
    document.getElementById('contact-email').value = siteContent.contact.info?.email || '';
  }

  // Footer
  if (siteContent.footer) {
    document.getElementById('footer-description').value = siteContent.footer.description || '';
    document.getElementById('footer-copyright').value = siteContent.footer.copyright || '';
  }

  // Social Media
  if (siteContent.social) {
    document.getElementById('social-facebook').value = siteContent.social.facebook || '';
    document.getElementById('social-twitter').value = siteContent.social.twitter || '';
    document.getElementById('social-instagram').value = siteContent.social.instagram || '';
    document.getElementById('social-linkedin').value = siteContent.social.linkedin || '';
    document.getElementById('social-youtube').value = siteContent.social.youtube || '';
  }
}

function renderItemsEditor(containerId, items, section) {
  const container = document.getElementById(containerId);
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <label style="margin:0;font-weight:600;">Items</label>
      <button type="button" class="btn btn-outline btn-sm" onclick="addItem('${section}')">
        <i class="fas fa-plus"></i> Add Item
      </button>
    </div>
    <div class="item-list" id="${containerId}-list">
      ${items.map((item, i) => renderItemCard(section, i, item)).join('')}
    </div>
  `;
}

function renderItemCard(section, index, item) {
  if (section === 'services') {
    return `
      <div class="item-card" data-index="${index}">
        <div class="item-card-header">
          <h4>Service #${index + 1}</h4>
          <button type="button" class="btn btn-danger btn-sm" onclick="removeItem('services', ${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="item-card-grid">
          <div class="form-group"><label>Icon Class</label><input type="text" class="svc-icon" value="${item.icon || ''}" placeholder="fa-home"></div>
          <div class="form-group"><label>Title</label><input type="text" class="svc-title" value="${item.title || ''}"></div>
          <div class="form-group"><label>Description</label><textarea class="svc-desc" rows="3">${item.description || ''}</textarea></div>
        </div>
      </div>
    `;
  } else {
    return `
      <div class="item-card" data-index="${index}">
        <div class="item-card-header">
          <h4>Gallery Item #${index + 1}</h4>
          <button type="button" class="btn btn-danger btn-sm" onclick="removeItem('gallery', ${index})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="item-card-grid">
          <div class="form-group"><label>Image URL</label><input type="text" class="gal-src" value="${item.src || ''}"></div>
          <div class="form-group"><label>Title</label><input type="text" class="gal-title" value="${item.title || ''}"></div>
          <div class="form-group"><label>Category</label><input type="text" class="gal-category" value="${item.category || ''}"></div>
        </div>
      </div>
    `;
  }
}

function renderFeaturesEditor() {
  const container = document.getElementById('about-features');
  const features = siteContent.about?.features || [];
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <label style="margin:0;font-weight:600;">Features</label>
      <button type="button" class="btn btn-outline btn-sm" onclick="addFeature()">
        <i class="fas fa-plus"></i> Add Feature
      </button>
    </div>
    <div class="item-list">
      ${features.map((f, i) => `
        <div class="item-card" data-index="${i}">
          <div class="item-card-header">
            <h4>Feature #${i + 1}</h4>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeFeature(${i})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="form-group"><input type="text" class="about-feature" value="${f}"></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStatsEditor() {
  const container = document.getElementById('stats-items');
  const items = siteContent.stats?.items || [];
  container.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <label style="margin:0;font-weight:600;">Stats</label>
      <button type="button" class="btn btn-outline btn-sm" onclick="addStat()">
        <i class="fas fa-plus"></i> Add Stat
      </button>
    </div>
    <div class="item-list">
      ${items.map((s, i) => `
        <div class="item-card" data-index="${i}">
          <div class="item-card-header">
            <h4>Stat #${i + 1}</h4>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeStat(${i})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="item-card-grid">
            <div class="form-group"><label>Number</label><input type="number" class="stat-number" value="${s.number || 0}"></div>
            <div class="form-group"><label>Label</label><input type="text" class="stat-label" value="${s.label || ''}"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addItem(section) {
  const items = siteContent[section]?.items || [];
  if (section === 'services') {
    items.push({ icon: 'fa-home', title: 'New Service', description: 'Description here' });
  } else {
    items.push({ src: '', title: 'New Item', category: 'Interior' });
  }
  siteContent[section].items = items;
  renderItemsEditor(section + '-items', items, section);
}

function removeItem(section, index) {
  siteContent[section].items.splice(index, 1);
  renderItemsEditor(section + '-items', siteContent[section].items, section);
}

function addFeature() {
  siteContent.about.features.push('New Feature');
  renderFeaturesEditor();
}

function removeFeature(index) {
  siteContent.about.features.splice(index, 1);
  renderFeaturesEditor();
}

function addStat() {
  siteContent.stats.items.push({ number: 0, label: 'New Stat' });
  renderStatsEditor();
}

function removeStat(index) {
  siteContent.stats.items.splice(index, 1);
  renderStatsEditor();
}

function showSection(section) {
  document.querySelectorAll('.section-panel').forEach((p) => p.classList.remove('active'));
  document.getElementById('panel-' + section).classList.add('active');

  const titles = {
    overview: 'Dashboard Overview',
    contacts: 'Contact Submissions',
    hero: 'Edit Hero Section',
    services: 'Edit Services Section',
    gallery: 'Edit Gallery Section',
    about: 'Edit About Section',
    stats: 'Edit Stats Section',
    contact: 'Edit Contact Info',
    footer: 'Edit Footer',
  };
  document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
}

function updateOverviewStats() {
  const contacts = siteContent.contacts?.length || 0;
  const services = siteContent.services?.items?.length || 0;
  const gallery = siteContent.gallery?.items?.length || 0;
  const stats = siteContent.stats?.items?.length || 0;

  document.getElementById('statContacts').textContent = contacts;
  document.getElementById('statServices').textContent = services;
  document.getElementById('statGallery').textContent = gallery;
  document.getElementById('statStats').textContent = stats;
}

async function saveSection(section) {
  let payload = {};

  if (section === 'hero') {
    payload = {
      title: document.getElementById('hero-title').value,
      subtitle: document.getElementById('hero-subtitle').value,
      primaryButton: document.getElementById('hero-primaryButton').value,
      secondaryButton: document.getElementById('hero-secondaryButton').value,
    };
  } else if (section === 'services') {
    const items = [];
    document.querySelectorAll('#services-items-list .item-card').forEach((card) => {
      items.push({
        icon: card.querySelector('.svc-icon').value,
        title: card.querySelector('.svc-title').value,
        description: card.querySelector('.svc-desc').value,
      });
    });
    payload = {
      tag: document.getElementById('services-tag').value,
      title: document.getElementById('services-title').value,
      description: document.getElementById('services-description').value,
      items,
    };
  } else if (section === 'gallery') {
    const items = [];
    document.querySelectorAll('#gallery-items-list .item-card').forEach((card) => {
      items.push({
        src: card.querySelector('.gal-src').value,
        title: card.querySelector('.gal-title').value,
        category: card.querySelector('.gal-category').value,
      });
    });
    payload = {
      tag: document.getElementById('gallery-tag').value,
      title: document.getElementById('gallery-title').value,
      description: document.getElementById('gallery-description').value,
      items,
    };
  } else if (section === 'about') {
    const features = [];
    document.querySelectorAll('#about-features .about-feature').forEach((input) => {
      features.push(input.value);
    });
    payload = {
      tag: document.getElementById('about-tag').value,
      title: document.getElementById('about-title').value,
      description: document.getElementById('about-description').value,
      description2: document.getElementById('about-description2').value,
      image: document.getElementById('about-image').value,
      experience: {
        number: document.getElementById('about-experience-number').value,
        text: document.getElementById('about-experience-text').value,
      },
      features,
    };
  } else if (section === 'stats') {
    const items = [];
    document.querySelectorAll('#stats-items .item-card').forEach((card) => {
      items.push({
        number: parseInt(card.querySelector('.stat-number').value) || 0,
        label: card.querySelector('.stat-label').value,
      });
    });
    payload = { items };
  } else if (section === 'contact') {
    payload = {
      tag: document.getElementById('contact-tag').value,
      title: document.getElementById('contact-title').value,
      description: document.getElementById('contact-description').value,
      info: {
        address: document.getElementById('contact-address').value,
        phone: document.getElementById('contact-phone').value,
        email: document.getElementById('contact-email').value,
      },
    };
  } else if (section === 'footer') {
    payload = {
      description: document.getElementById('footer-description').value,
      copyright: document.getElementById('footer-copyright').value,
    };
  } else if (section === 'social') {
    payload = {
      facebook: document.getElementById('social-facebook').value,
      twitter: document.getElementById('social-twitter').value,
      instagram: document.getElementById('social-instagram').value,
      linkedin: document.getElementById('social-linkedin').value,
      youtube: document.getElementById('social-youtube').value,
    };
  }

  try {
    const res = await fetch('/api/content/' + section, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      siteContent[section] = payload;
      updateOverviewStats();
      showMessage('Changes saved successfully!', 'success');
    } else {
      showMessage(data.error || 'Failed to save.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

async function loadContacts() {
  try {
    const res = await fetch('/api/contacts');
    const data = await res.json();
    const tbody = document.querySelector('#contactsTable tbody');
    const empty = document.getElementById('contactsEmpty');

    if (data.success && data.contacts.length > 0) {
      tbody.innerHTML = data.contacts.map((c) => `
        <tr data-id="${c._id}">
          <td>${escapeHtml(c.name)}</td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(c.phone || '-')}</td>
          <td>${escapeHtml(c.service || '-')}</td>
          <td>${escapeHtml(c.message)}</td>
          <td>${new Date(c.createdAt).toLocaleDateString()}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteContact('${c._id}')"><i class="fas fa-trash"></i></button></td>
        </tr>
      `).join('');
      document.getElementById('contactsTable').style.display = 'table';
      empty.style.display = 'none';
    } else {
      document.getElementById('contactsTable').style.display = 'none';
      empty.style.display = 'block';
    }
  } catch {
    showMessage('Failed to load contacts.', 'error');
  }
}

async function deleteContact(id) {
  if (!confirm('Are you sure you want to delete this contact?')) return;
  try {
    const res = await fetch('/api/contacts/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadContacts();
      showMessage('Contact deleted.', 'success');
    } else {
      showMessage(data.error || 'Failed to delete.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    const tbody = document.querySelector('#productsTable tbody');
    const empty = document.getElementById('productsEmpty');

    if (data.success && data.products.length > 0) {
      tbody.innerHTML = data.products.map((p) => `
        <tr data-id="${p._id}">
          <td>${escapeHtml(p.name)}</td>
          <td>${escapeHtml(p.category)}</td>
          <td>$${p.price}</td>
          <td>${p.isPro ? '<i class="fas fa-star text-warning"></i> Pro' : 'Free'}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="editProduct('${p._id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p._id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
      document.getElementById('productsTable').style.display = 'table';
      empty.style.display = 'none';
    } else {
      document.getElementById('productsTable').style.display = 'none';
      empty.style.display = 'block';
    }
  } catch {
    showMessage('Failed to load products.', 'error');
  }
}

async function loadReviews() {
  try {
    const res = await fetch('/api/reviews/admin/all');
    const data = await res.json();
    const tbody = document.querySelector('#reviewsTable tbody');
    const empty = document.getElementById('reviewsEmpty');

    if (data.success && data.reviews.length > 0) {
      tbody.innerHTML = data.reviews.map((r) => `
        <tr data-id="${r._id}">
          <td>${escapeHtml(r.customer?.name || 'Unknown')}</td>
          <td>${escapeHtml(r.product?.name || 'General')}</td>
          <td>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</td>
          <td>${escapeHtml(r.comment.substring(0, 50))}...</td>
          <td>${r.isApproved ? '<span class="text-success">Approved</span>' : '<span class="text-warning">Pending</span>'}</td>
          <td>
            ${!r.isApproved ? `<button class="btn btn-success btn-sm" onclick="approveReview('${r._id}')"><i class="fas fa-check"></i></button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteReview('${r._id}')"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
      document.getElementById('reviewsTable').style.display = 'table';
      empty.style.display = 'none';
    } else {
      document.getElementById('reviewsTable').style.display = 'none';
      empty.style.display = 'block';
    }
  } catch {
    showMessage('Failed to load reviews.', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const res = await fetch('/api/products/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadProducts();
      showMessage('Product deleted.', 'success');
    } else {
      showMessage(data.error || 'Failed to delete.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

async function approveReview(id) {
  try {
    const res = await fetch('/api/reviews/' + id + '/approve', { method: 'PUT' });
    const data = await res.json();
    if (data.success) {
      loadReviews();
      showMessage('Review approved.', 'success');
    } else {
      showMessage(data.error || 'Failed to approve.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    const res = await fetch('/api/reviews/' + id, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadReviews();
      showMessage('Review deleted.', 'success');
    } else {
      showMessage(data.error || 'Failed to delete.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

function showAddProductModal() {
  // Simple prompt for now - could be enhanced with a modal
  const name = prompt('Product Name:');
  if (!name) return;
  const description = prompt('Description:');
  if (!description) return;
  const category = prompt('Category:');
  if (!category) return;
}

// ================= Members Management =================
async function loadMembers() {
  try {
    const res = await fetch('/api/admin/members');
    const data = await res.json();
    if (data.success) {
      renderMembersTable(data.data || []);
    } else {
      showMessage('Failed to load members.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

function renderMembersTable(members) {
  const tbody = document.querySelector('#membersTable tbody');
  const emptyState = document.getElementById('membersEmpty');
  
  if (members.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  tbody.innerHTML = members.map(member => `
    <tr>
      <td>${member.name || 'N/A'}</td>
      <td>${member.email || 'N/A'}</td>
      <td>${member.phone || 'N/A'}</td>
      <td>${member.address || 'N/A'}</td>
      <td>${new Date(member.createdAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

// ================= Announcements Management =================
async function loadAnnouncements() {
  try {
    const res = await fetch('/api/admin/announcements');
    const data = await res.json();
    if (data.success) {
      renderAnnouncementsCards(data.data || []);
    } else {
      showMessage('Failed to load announcements.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

function renderAnnouncementsCards(announcements) {
  const container = document.getElementById('announcementsContainer');
  const emptyState = document.getElementById('announcementsEmpty');
  
  if (announcements.length === 0) {
    container.innerHTML = '<div class="empty-state" id="announcementsEmpty" style="display:flex;"><i class="fas fa-bullhorn"></i><p>No announcements yet. Create one to get started!</p></div>';
    return;
  }
  
  container.innerHTML = announcements.map(ann => `
    <div class="announcement-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 15px; background: white;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
        <div>
          <h4 style="margin: 0 0 5px 0; color: #333;">${ann.title}</h4>
          <p style="margin: 0; font-size: 12px; color: #999;">
            By ${ann.createdBy} • ${new Date(ann.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <span class="badge ${ann.status === 'sent' ? 'badge-success' : 'badge-warning'}" style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${ann.status === 'sent' ? '#d4edda' : '#fff3cd'}; color: ${ann.status === 'sent' ? '#155724' : '#856404'};">
            ${ann.status.charAt(0).toUpperCase() + ann.status.slice(1)}
          </span>
        </div>
      </div>
      <p style="margin: 10px 0; color: #555; line-height: 1.5;">${ann.message.substring(0, 200)}${ann.message.length > 200 ? '...' : ''}</p>
      <div style="display: flex; gap: 8px; margin-top: 15px;">
        ${ann.status === 'draft' ? `
          <button class="btn btn-primary btn-sm" onclick="editAnnouncement('${ann._id}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-success btn-sm" onclick="sendAnnouncement('${ann._id}')"><i class="fas fa-paper-plane"></i> Send</button>
        ` : `
          <span style="color: #28a745; font-size: 12px;">
            <i class="fas fa-check-circle"></i> Sent to ${ann.recipientCount} member(s)
          </span>
        `}
        <button class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${ann._id}')"><i class="fas fa-trash"></i> Delete</button>
      </div>
    </div>
  `).join('');
}

function showCreateAnnouncementModal() {
  const title = prompt('Announcement Title:');
  if (!title) return;
  
  const message = prompt('Announcement Message (you can use \\n for line breaks):');
  if (!message) return;
  
  createAnnouncement(title, message);
}

async function createAnnouncement(title, message) {
  try {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message })
    });
    const data = await res.json();
    if (data.success) {
      loadAnnouncements();
      showMessage('Announcement created successfully!', 'success');
    } else {
      showMessage(data.error || 'Failed to create announcement.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

async function sendAnnouncement(id) {
  if (!confirm('Send this announcement to all registered members?')) return;
  
  try {
    const res = await fetch(`/api/admin/announcements/${id}/send`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      loadAnnouncements();
      showMessage(`✓ Announcement sent to ${data.data.successfulSends} member(s)!`, 'success');
    } else {
      showMessage(data.error || 'Failed to send announcement.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

async function editAnnouncement(id) {
  const title = prompt('Edit Announcement Title:');
  if (!title) return;
  
  const message = prompt('Edit Announcement Message:');
  if (!message) return;
  
  try {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message })
    });
    const data = await res.json();
    if (data.success) {
      loadAnnouncements();
      showMessage('Announcement updated successfully!', 'success');
    } else {
      showMessage(data.error || 'Failed to update announcement.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

async function deleteAnnouncement(id) {
  if (!confirm('Are you sure you want to delete this announcement?')) return;
  
  try {
    const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadAnnouncements();
      showMessage('Announcement deleted successfully!', 'success');
    } else {
      showMessage(data.error || 'Failed to delete announcement.', 'error');
    }
  } catch (err) {
    showMessage('Connection error.', 'error');
  }
}

// Call initial load for members and announcements
window.addEventListener('DOMContentLoaded', () => {
  loadMembers();
  loadAnnouncements();
});
  const price = parseFloat(prompt('Price:'));
  const isPro = confirm('Is this a Pro feature?');

  addProduct({ name, description, category, price, isPro });
}

async function addProduct(product) {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (data.success) {
      loadProducts();
      showMessage('Product added.', 'success');
    } else {
      showMessage(data.error || 'Failed to add.', 'error');
    }
  } catch {
    showMessage('Connection error.', 'error');
  }
}

function editProduct(id) {
  // For now, just show current product - could be enhanced
  alert('Edit functionality coming soon. Product ID: ' + id);
}

function showMessage(text, type) {
  const msg = document.getElementById('globalMessage');
  msg.textContent = text;
  msg.className = 'message show ' + type;
  setTimeout(() => {
    msg.className = 'message';
    msg.textContent = '';
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

