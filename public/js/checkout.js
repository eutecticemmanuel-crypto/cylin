import { cartGetItems, cartGetSubtotal, cartClear } from './cart.js';

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function renderCheckoutItems() {
  const items = cartGetItems();
  const container = document.getElementById('checkoutItems');
  const empty = document.getElementById('checkoutEmpty');
  const subtotalEl = document.getElementById('checkoutSubtotal');

  if (!container || !subtotalEl || !empty) return;

  if (items.length === 0) {
    container.innerHTML = '';
    subtotalEl.textContent = '$0.00';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  container.innerHTML = items.map((item) => `
    <div class="checkout-item">
      <div class="checkout-item-row">
        <div>
          <strong>${item.name}</strong>
          <div class="text-muted">${item.category || 'Product'}</div>
        </div>
        <div>${formatMoney(item.price)} x ${item.qty}</div>
      </div>
    </div>
  `).join('');

  subtotalEl.textContent = formatMoney(cartGetSubtotal());
}

async function submitOrder(event) {
  event.preventDefault();
  const items = cartGetItems();
  const message = document.getElementById('checkoutMessage');

  if (items.length === 0) {
    if (message) {
      message.textContent = 'Your cart is empty. Add items before placing an order.';
      message.className = 'form-message error';
    }
    return;
  }

  const payload = {
    items: items.map((item) => ({
      productId: item.productId,
      name: item.name,
      category: item.category,
      image: item.image,
      price: item.price,
      quantity: item.qty,
      isPro: item.isPro || false
    })),
    customerName: document.getElementById('customerName').value.trim(),
    customerEmail: document.getElementById('customerEmail').value.trim(),
    customerPhone: document.getElementById('customerPhone').value.trim(),
    customerAddress: document.getElementById('customerAddress').value.trim()
  };

  if (!payload.customerName || !payload.customerEmail || !payload.customerAddress) {
    message.textContent = 'Please complete your contact and shipping details.';
    message.className = 'form-message error';
    return;
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.success) {
      cartClear();
      renderCheckoutItems();
      document.getElementById('checkoutForm').reset();
      message.textContent = 'Order placed successfully! Check your email for confirmation.';
      message.className = 'form-message success';
    } else {
      message.textContent = result.error || 'Unable to place order.';
      message.className = 'form-message error';
    }
  } catch (err) {
    message.textContent = 'Connection error. Please try again.';
    message.className = 'form-message error';
  }
}

function initCheckout() {
  renderCheckoutItems();
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', submitOrder);
  }
}

document.addEventListener('DOMContentLoaded', initCheckout);
