import { cartGetItems, cartGetCount, cartGetSubtotal, cartUpdateQty, cartRemoveItem, cartClear } from './cart.js';

function formatMoney(n) {
  return '$' + (Number(n) || 0).toFixed(2);
}

function renderCart() {
  const itemsWrap = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const badge = document.getElementById('cartBadge');
  const subtotalEl = document.getElementById('cartSubtotal');

  if (!itemsWrap || !badge || !subtotalEl) return;

  const items = cartGetItems();
  const count = cartGetCount();
  const subtotal = cartGetSubtotal();

  badge.textContent = String(count);
  subtotalEl.textContent = formatMoney(subtotal);

  if (!items.length) {
    itemsWrap.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  itemsWrap.innerHTML = items.map((it) => {
    return `
      <div class="cart-item" data-id="${it.productId}">
        <div class="cart-item-media">
          ${it.image ? `<img src="${it.image}" alt="${it.name}" loading="lazy">` : '<i class="fas fa-paint-roller"></i>'}
        </div>
        <div class="cart-item-body">
          <div class="cart-item-top">
            <div class="cart-item-name">${it.name}</div>
            <button type="button" class="cart-item-remove" aria-label="Remove ${it.name}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="cart-item-meta">
            <div class="cart-qty">
              <button type="button" class="qty-btn" data-action="dec" aria-label="Decrease quantity">-</button>
              <input class="qty-input" type="number" min="1" step="1" value="${it.qty}" aria-label="Quantity" />
              <button type="button" class="qty-btn" data-action="inc" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-price">${formatMoney(it.price * it.qty)}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  itemsWrap.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemEl = btn.closest('.cart-item');
      if (!itemEl) return;
      cartRemoveItem(itemEl.dataset.id);
    });
  });

  itemsWrap.querySelectorAll('.cart-item .qty-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemEl = btn.closest('.cart-item');
      const id = itemEl?.dataset?.id;
      const input = itemEl?.querySelector('.qty-input');
      if (!id || !input) return;
      const current = Number(input.value) || 1;
      const next = btn.dataset.action === 'inc' ? current + 1 : current - 1;
      cartUpdateQty(id, next);
    });
  });

  itemsWrap.querySelectorAll('.qty-input').forEach((input) => {
    input.addEventListener('change', () => {
      const itemEl = input.closest('.cart-item');
      const id = itemEl?.dataset?.id;
      if (!id) return;
      cartUpdateQty(id, input.value);
    });
  });
}

function initCartPanel() {
  const launcher = document.getElementById('cartLauncher');
  const panel = document.getElementById('cartPanel');
  const closeBtn = document.getElementById('cartClose');
  const clearBtn = document.getElementById('cartClear');

  if (!launcher || !panel) return;

  const open = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  };
  const close = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  };

  launcher.addEventListener('click', () => open());
  if (closeBtn) closeBtn.addEventListener('click', () => close());

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      cartClear();
      close();
    });
  }

  // Close when clicking backdrop area (optional)
  panel.addEventListener('click', (e) => {
    if (e.target === panel) close();
  });

  document.addEventListener('cart:updated', () => {
    renderCart();
  });

  renderCart();
}

document.addEventListener('DOMContentLoaded', initCartPanel);

