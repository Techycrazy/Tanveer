const state = {
  activeCategory: 'all',
  query: '',
  cart: [],
  user: null,
};

const productCards = Array.from(document.querySelectorAll('.product-card'));
const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
const cartDrawer = document.getElementById('cart-drawer');
const cartList = document.getElementById('cart-items');
const emptyCart = document.getElementById('empty-cart');
const cartCount = document.getElementById('cart-count');
const toast = document.getElementById('toast');
const loginDialog = document.getElementById('login-dialog');
const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const searchInput = document.getElementById('search-input');
const moreBtn = document.getElementById('more-btn');
const moreMenu = document.getElementById('more-menu');
const storageKey = 'tanveer-storefront-state';

const saveState = () => {
  localStorage.setItem(storageKey, JSON.stringify({ cart: state.cart, user: state.user }));
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data.cart)) {
      state.cart = data.cart;
    }
    if (typeof data.user === 'string' && data.user) {
      state.user = data.user;
      loginBtn.textContent = `Hi, ${state.user}`;
    }
  } catch {
    localStorage.removeItem(storageKey);
  }
};

const showToast = (text) => {
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

document.getElementById('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  state.query = searchInput.value.trim();
  renderProducts();
  showToast(state.query ? `Showing results for "${state.query}"` : 'Search cleared');
});

searchInput.addEventListener('input', () => {
  state.query = searchInput.value.trim();
  renderProducts();
});

productCards.forEach((card) => {
  const productName = card.dataset.name;
  card.querySelector('.add-cart-btn').addEventListener('click', () => {
    state.cart.push(productName);
    renderCart();
    showToast(`${productName} added to cart`);
  });
});

document.getElementById('cart-btn').addEventListener('click', () => {
  cartDrawer.hidden = false;
});

document.getElementById('close-cart').addEventListener('click', () => {
  cartDrawer.hidden = true;
});

document.getElementById('shop-now-btn').addEventListener('click', () => {
  document.getElementById('electronics-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

document.getElementById('cancel-login').addEventListener('click', () => {
  loginDialog.close();
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  state.user = email.split('@')[0] || 'User';
  loginBtn.textContent = `Hi, ${state.user}`;
  loginDialog.close();
  saveState();
  showToast(`Welcome ${state.user}`);
});

document.getElementById('clear-cart').addEventListener('click', () => {
  state.cart = [];
  renderCart();
  showToast('Cart cleared');
});

document.getElementById('seller-btn').addEventListener('click', () => {
  showToast('Seller onboarding starts in demo mode');
});

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

loadState();
renderProducts();
renderCart();
