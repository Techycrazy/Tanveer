const state = {
  activeCategory: 'all',
  query: '',
  cart: [],
  user: null,
};

const storageKey = 'tanveer-storefront-state';
const byId = (id) => document.getElementById(id);
const productCards = Array.from(document.querySelectorAll('.product-card'));
const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
const cartDrawer = byId('cart-drawer');
const cartList = byId('cart-items');
const emptyCart = byId('empty-cart');
const cartCount = byId('cart-count');
const toast = byId('toast');
const loginDialog = byId('login-dialog');
const loginBtn = byId('login-btn') || document.querySelector('.actions a[href="#"]');
const loginForm = byId('login-form');
const searchInput = byId('search-input') || document.querySelector('.search-box input');
const searchForm = byId('search-form') || document.querySelector('.search-box');
const moreBtn = byId('more-btn');
const moreMenu = byId('more-menu');

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify({ cart: state.cart, user: state.user }));
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.cart)) state.cart = data.cart;
    if (typeof data.user === 'string' && data.user && loginBtn) {
      state.user = data.user;
      loginBtn.textContent = `Hi, ${state.user}`;
    }
  } catch {
    localStorage.removeItem(storageKey);
  }
};

const showToast = (text) => {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
};

const renderProducts = () => {
  productCards.forEach((card) => {
    const name = (card.dataset.name || '').toLowerCase();
    const categories = (card.dataset.category || '').toLowerCase();
    const matchCategory = state.activeCategory === 'all' || categories.includes(state.activeCategory);
    const matchSearch = name.includes(state.query.toLowerCase());
    card.classList.toggle('hidden', !(matchCategory && matchSearch));
  });
};

const renderCart = () => {
  if (!cartList || !cartCount || !emptyCart) return;
  cartList.innerHTML = '';
  state.cart.forEach((name, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${name}`;
    cartList.append(li);
  });
  cartCount.textContent = state.cart.length;
  emptyCart.hidden = state.cart.length > 0;
  saveState();
};

categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    state.activeCategory = button.dataset.category;
    categoryButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderProducts();
  });
});

if (searchForm && searchInput) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = searchInput.value.trim();
    renderProducts();
    showToast(state.query ? `Showing results for "${state.query}"` : 'Search cleared');
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    renderProducts();
  });
}

productCards.forEach((card) => {
  const productName = card.dataset.name;
  const addButton = card.querySelector('.add-cart-btn');
  if (!addButton) return;
  addButton.addEventListener('click', () => {
    state.cart.push(productName);
    renderCart();
    showToast(`${productName} added to cart`);
  });
});

byId('cart-btn')?.addEventListener('click', () => {
  if (cartDrawer) cartDrawer.hidden = false;
});

byId('close-cart')?.addEventListener('click', () => {
  if (cartDrawer) cartDrawer.hidden = true;
});

byId('shop-now-btn')?.addEventListener('click', () => {
  byId('electronics-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  state.activeCategory = 'electronics';
  categoryButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.category === 'electronics'));
  renderProducts();
  showToast('Electronics deals unlocked');
});

document.querySelectorAll('.view-all').forEach((button) => {
  button.addEventListener('click', () => {
    state.activeCategory = button.dataset.focus;
    categoryButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.category === button.dataset.focus));
    renderProducts();
    showToast(`Viewing all ${button.dataset.focus} products`);
  });
});

if (loginBtn && loginDialog && loginForm) {
  loginBtn.addEventListener('click', () => {
    if (state.user) {
      state.user = null;
      loginBtn.textContent = 'Login';
      saveState();
      showToast('Logged out');
      return;
    }
    loginDialog.showModal();
  });

  byId('cancel-login')?.addEventListener('click', () => loginDialog.close());

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = byId('email')?.value.trim() || '';
    state.user = email.split('@')[0] || 'User';
    loginBtn.textContent = `Hi, ${state.user}`;
    loginDialog.close();
    saveState();
    showToast(`Welcome ${state.user}`);
  });
}

byId('clear-cart')?.addEventListener('click', () => {
  state.cart = [];
  renderCart();
  showToast('Cart cleared');
});

byId('seller-btn')?.addEventListener('click', () => {
  showToast('Seller onboarding starts in demo mode');
});

if (moreBtn && moreMenu) {
  moreBtn.addEventListener('click', () => {
    const open = moreBtn.getAttribute('aria-expanded') === 'true';
    moreBtn.setAttribute('aria-expanded', String(!open));
    moreMenu.hidden = open;
  });

  moreMenu.addEventListener('click', (event) => {
    if (event.target instanceof HTMLButtonElement) {
      showToast(`${event.target.textContent} coming soon`);
      moreMenu.hidden = true;
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.more-wrap') && !moreMenu.hidden) {
      moreMenu.hidden = true;
      moreBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

loadState();
renderProducts();
renderCart();
