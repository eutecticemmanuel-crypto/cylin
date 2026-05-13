// Products page functionality
let currentUser = null;
let allProducts = [];
let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadProducts();
  await loadReviews();

  const search = document.getElementById('productSearch');
  if (search) {
    search.addEventListener('input', renderProducts);
  }
});

async function checkAuth() {
  try {
    const res = await fetch('/api/customers/me');
    const data = await res.json();
    if (data.success) {
      currentUser = data.customer;
      updateAuthLinks(true);
    } else {
      updateAuthLinks(false);
    }
  } catch {
    updateAuthLinks(false);
  }
}

function updateAuthLinks(isLoggedIn) {
  const authLinks = document.getElementById('authLinks');
  if (isLoggedIn) {
    authLinks.innerHTML = `
      <span class="nav-link">Welcome, ${currentUser.name}</span>
      <a href="#" class="nav-link" onclick="logout()">Logout</a>
    `;
  } else {
    authLinks.innerHTML = `
      <a href="/login" class="nav-link">Login</a>
      <a href="/register" class="nav-link">Register</a>
    `;
  }
}

async function logout() {
  try {
    await fetch('/api/customers/logout', { method: 'POST' });
    currentUser = null;
    updateAuthLinks(false);
    location.reload();
  } catch {
    alert('Logout failed');
  }
}

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('productsEmpty');

    if (data.success && data.products.length > 0) {
      allProducts = data.products;
      renderCategoryFilters();
      renderProducts();
      grid.style.display = 'grid';
      empty.style.display = 'none';
    } else {
      allProducts = [];
      grid.style.display = 'none';
      empty.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function renderCategoryFilters() {
  const filters = document.getElementById('categoryFilters');
  if (!filters) return;

  const categories = ['All', ...new Set(allProducts.map((product) => product.category).filter(Boolean))];
  filters.innerHTML = categories.map((category) => `
    <button type="button" class="category-pill ${category === activeCategory ? 'active' : ''}" data-category="${category}">
      ${category}
    </button>
  `).join('');

  filters.querySelectorAll('.category-pill').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderCategoryFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('productsEmpty');
  const search = document.getElementById('productSearch');
  const query = search ? search.value.trim().toLowerCase() : '';

  const products = allProducts.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = !query || [product.name, product.description, product.category]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  if (products.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.innerHTML = products.map(product => `
    <article class="product-card" onclick="openProductModal('${product._id}')">
      ${product.isPro ? '<div class="pro-badge"><i class="fas fa-star"></i> Pro</div>' : ''}
      <div class="product-media">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" loading="lazy">` : '<i class="fas fa-paint-roller"></i>'}
      </div>
      <div class="product-body">
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="stock-badge">Available</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-footer">
          <div>
            <span class="price-label">Starting at</span>
            <div class="product-price">$${Number(product.price).toFixed(2)}</div>
          </div>
          <button type="button" class="icon-action" aria-label="View ${product.name}">
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
  grid.style.display = 'grid';
  empty.style.display = 'none';
}

async function loadReviews() {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    const grid = document.getElementById('reviewsGrid');
    const empty = document.getElementById('reviewsEmpty');

    if (data.success && data.reviews.length > 0) {
      grid.innerHTML = data.reviews.map(review => `
        <div class="gallery-item review-item">
          <div class="review-header">
            <div class="review-rating">
              ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
            </div>
            <div class="review-author">${review.customer?.name || 'Anonymous'}</div>
          </div>
          <p class="review-comment">${review.comment}</p>
          ${review.product ? `<div class="review-product">About: ${review.product.name}</div>` : ''}
        </div>
      `).join('');
      grid.style.display = 'grid';
      empty.style.display = 'none';
    } else {
      grid.style.display = 'none';
      empty.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to load reviews:', error);
  }
}

async function openProductModal(productId) {
  try {
    const res = await fetch('/api/products/' + productId);
    const data = await res.json();

    if (data.success) {
      const product = data.product;
      const modal = document.getElementById('productModal');
      const details = document.getElementById('productDetails');

      details.innerHTML = `
        <div class="modal-product-grid">
          <div class="modal-product-media">
            ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-paint-roller"></i>'}
          </div>
          <div>
            <span class="product-category">${product.category}</span>
            <h2>${product.name}</h2>
            <p>${product.description}</p>
            <div class="modal-price">$${Number(product.price).toFixed(2)}</div>
            ${product.isPro ? '<p class="modal-pro"><i class="fas fa-star"></i> Pro Feature</p>' : ''}
          </div>
        </div>
        ${product.features && product.features.length > 0 ? `
          <div class="feature-list">
            ${product.features.map(f => `<span><i class="fas fa-check"></i> ${f}</span>`).join('')}
          </div>
        ` : ''}

        ${currentUser ? `
          <div class="review-form-wrap">
            <h3>Leave a Review</h3>
            <form id="reviewForm">
              <div class="form-group">
                <label>Rating:</label>
                <select id="reviewRating" required>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div class="form-group">
                <label>Comment:</label>
                <textarea id="reviewComment" rows="4" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit Review</button>
            </form>
            <div id="reviewMessage"></div>
          </div>
        ` : `
          <p class="login-review"><a href="/login">Login</a> to leave a review.</p>
        `}
      `;

      modal.style.display = 'block';

      // Handle review form
      if (currentUser) {
        document.getElementById('reviewForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const rating = document.getElementById('reviewRating').value;
          const comment = document.getElementById('reviewComment').value;

          try {
            const reviewRes = await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ product: productId, rating, comment })
            });

            const reviewData = await reviewRes.json();
            const messageDiv = document.getElementById('reviewMessage');

            if (reviewData.success) {
              messageDiv.innerHTML = '<div class="alert alert-success">Review submitted! It will be visible after approval.</div>';
              e.target.reset();
              setTimeout(() => loadReviews(), 2000);
            } else {
              messageDiv.innerHTML = `<div class="alert alert-error">${reviewData.error}</div>`;
            }
          } catch {
            document.getElementById('reviewMessage').innerHTML = '<div class="alert alert-error">Failed to submit review.</div>';
          }
        });
      }
    }
  } catch (error) {
    console.error('Failed to load product:', error);
  }
}

function closeModal() {
  document.getElementById('productModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('productModal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}
