// Cylin Painters - Cart (localStorage) 

const CART_STORAGE_KEY = 'cylin_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { items: {} };
    if (!parsed.items || typeof parsed.items !== 'object') parsed.items = {};
    return parsed;
  } catch {
    return { items: {} };
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function cartGetItems() {
  const cart = loadCart();
  return Object.entries(cart.items).map(([id, item]) => ({
    ...item,
    productId: id,
  }));
}

export function cartGetCount() {
  const items = cartGetItems();
  return items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
}

export function cartGetSubtotal() {
  const items = cartGetItems();
  return items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
}

export function cartAddItem(product) {
  // product: { _id, name, price, image, category }
  if (!product || !product._id) return;

  const cart = loadCart();
  const id = product._id;

  if (!cart.items[id]) {
    cart.items[id] = {
      productId: id,
      qty: 0,
      name: product.name || 'Item',
      price: Number(product.price) || 0,
      image: product.image || '',
      category: product.category || '',
    };
  }

  cart.items[id].qty += 1;
  saveCart(cart);

  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export function cartUpdateQty(productId, qty) {
  const cart = loadCart();
  if (!cart.items[productId]) return;

  const nextQty = Number(qty);
  if (!Number.isFinite(nextQty) || nextQty <= 0) {
    delete cart.items[productId];
  } else {
    cart.items[productId].qty = nextQty;
  }

  saveCart(cart);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export function cartRemoveItem(productId) {
  const cart = loadCart();
  if (!cart.items[productId]) return;
  delete cart.items[productId];
  saveCart(cart);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

export function cartClear() {
  localStorage.removeItem(CART_STORAGE_KEY);
  document.dispatchEvent(new CustomEvent('cart:updated'));
}

// Expose helpers for non-module inline handlers (products.html uses inline onclick)
if (typeof window !== 'undefined') {
  window.cylinCart = {
    add: (product) => cartAddItem(product),
    updateQty: (productId, qty) => cartUpdateQty(productId, qty),
    remove: (productId) => cartRemoveItem(productId),
    clear: () => cartClear(),
    getCount: () => cartGetCount(),
  };
}


