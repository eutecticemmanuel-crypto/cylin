// Cylin Painters - Favorites (localStorage)

const FAV_STORAGE_KEY = 'cylin_favorites_v1';

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return { ids: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ids: [] };
    if (!Array.isArray(parsed.ids)) parsed.ids = [];
    return parsed;
  } catch {
    return { ids: [] };
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favs));
}

export function favoritesIsSaved(productId) {
  const favs = loadFavorites();
  return favs.ids.includes(productId);
}

export function favoritesToggle(product) {
  if (!product || !product._id) return false;
  const id = product._id;
  const favs = loadFavorites();

  const idx = favs.ids.indexOf(id);
  let nowSaved = false;

  if (idx >= 0) {
    favs.ids.splice(idx, 1);
  } else {
    favs.ids.push(id);
    nowSaved = true;
  }

  saveFavorites(favs);
  document.dispatchEvent(new CustomEvent('favorites:updated'));
  return nowSaved;
}

export function favoritesGetAllIds() {
  const favs = loadFavorites();
  return favs.ids;
}

export function favoritesClear() {
  localStorage.removeItem(FAV_STORAGE_KEY);
  document.dispatchEvent(new CustomEvent('favorites:updated'));
}

// Expose helpers for non-module inline handlers (products.html uses inline onclick)
if (typeof window !== 'undefined') {
  window.cylinFavorites = {
    has: (id) => favoritesIsSaved(id),
    toggle: (product) => favoritesToggle(product),
    allIds: () => favoritesGetAllIds(),
    clear: () => favoritesClear(),
  };
}


