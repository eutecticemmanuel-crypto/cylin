// Products page functionality
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadProducts();
  await loadReviews();
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
      grid.innerHTML = data.products.map(product => `
        <div class="service-card product-card" onclick="openProductModal('${product._id}')">
          ${product.isPro ? '<div class="pro-badge"><i class="fas fa-star"></i> Pro</div>' : ''}
          <div class="service-icon">
            <i class="fas fa-box"></i>
          </div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="product-price">$${product.price}</div>
          <span class="product-category">${product.category}</span>
        </div>
      `).join('');
      grid.style.display = 'grid';
      empty.style.display = 'none';
    } else {
      grid.style.display = 'none';
      empty.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to load products:', error);
  }
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
        <h2>${product.name}</h2>
        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; height: 200px; object-fit: cover; margin-bottom: 1rem;">` : ''}
        <p><strong>Description:</strong> ${product.description}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Price:</strong> $${product.price}</p>
        ${product.isPro ? '<p><strong><i class="fas fa-star"></i> Pro Feature</strong></p>' : ''}
        ${product.features && product.features.length > 0 ? `
          <p><strong>Features:</strong></p>
          <ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul>
        ` : ''}

        ${currentUser ? `
          <div style="margin-top: 2rem;">
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
              <button type="submit" class="btn btn-primary">Submit Review</button>
            </form>
            <div id="reviewMessage"></div>
          </div>
        ` : `
          <p style="margin-top: 2rem;"><a href="/login">Login</a> to leave a review.</p>
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