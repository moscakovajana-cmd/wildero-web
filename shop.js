// ============================================
//  WILDERO SHOP – shop.js
// ============================================

// ---------- Product Catalogue ----------
const PRODUCTS = {
    'nalepky-vyprava': {
        name: 'Sada nálepek – Výprava do lesa',
        price: 69,
        img: 'shop_stickers.png',
        cat: 'nalepky'
    },
    'omalovanka-les': {
        name: 'Wildiny dobrodružství – Omalovánky',
        price: 149,
        img: 'shop_coloring.png',
        cat: 'omalovánky'
    },
    'sesit-vypravnik': {
        name: 'Wildero Výpravník – Zápisník dobrodruha',
        price: 199,
        img: 'shop_notebook.png',
        cat: 'sesity'
    },
    'balicek-start': {
        name: 'Startovní balíček dobrodruha',
        price: 299,
        img: 'shop_bag.png',
        cat: 'balicky'
    },
    'odznaky-set': {
        name: 'Kolekce odznaků – Lesní přátelé',
        price: 129,
        img: 'shop_badges.png',
        cat: 'odznaky'
    },
    'balicek-rodina': {
        name: 'Rodinný balíček odměn',
        price: 549,
        img: 'reward_stickers.png',
        cat: 'balicky'
    }
};

// ---------- Cart State ----------
let cart = JSON.parse(localStorage.getItem('wildero_cart') || '{}');

// ---------- DOM References ----------
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartFab = document.getElementById('cart-fab');
const cartFabCount = document.getElementById('cart-fab-count');
const cartBody = document.getElementById('cart-body');
const cartEmpty = document.getElementById('cart-empty');
const cartItemsList = document.getElementById('cart-items');
const cartFooter = document.getElementById('cart-footer');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartShippingNote = document.getElementById('cart-shipping-note');

// ---------- Open / Close Cart ----------
function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartFab.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ---------- Add to Cart ----------
function addToCart(productId) {
    const product = PRODUCTS[productId];
    if (!product) return;

    if (!cart[productId]) {
        cart[productId] = 0;
    }
    cart[productId]++;
    saveCart();
    renderCart();
    showAddFeedback(productId);
    openCart();
}

function showAddFeedback(productId) {
    const btn = document.getElementById(`btn-${productId}`);
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✓ Přidáno!';
    btn.classList.add('added');
    setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('added');
    }, 1800);
}

// ---------- Remove / Change Qty ----------
function removeFromCart(productId) {
    delete cart[productId];
    saveCart();
    renderCart();
}

function changeQty(productId, delta) {
    if (!cart[productId]) return;
    cart[productId] = Math.max(0, cart[productId] + delta);
    if (cart[productId] === 0) {
        delete cart[productId];
    }
    saveCart();
    renderCart();
}

// ---------- Save Cart ----------
function saveCart() {
    localStorage.setItem('wildero_cart', JSON.stringify(cart));
}

// ---------- Render Cart ----------
function renderCart() {
    const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const total = Object.entries(cart).reduce((sum, [id, qty]) => {
        return sum + (PRODUCTS[id]?.price || 0) * qty;
    }, 0);

    // FAB count
    if (itemCount > 0) {
        cartFabCount.textContent = itemCount;
        cartFabCount.style.display = 'inline-flex';
    } else {
        cartFabCount.style.display = 'none';
    }

    // Empty/items toggle
    if (itemCount === 0) {
        cartEmpty.style.display = 'block';
        cartItemsList.style.display = 'none';
        cartFooter.style.display = 'none';
    } else {
        cartEmpty.style.display = 'none';
        cartItemsList.style.display = 'flex';
        cartFooter.style.display = 'block';

        // Render items
        cartItemsList.innerHTML = '';
        Object.entries(cart).forEach(([id, qty]) => {
            const product = PRODUCTS[id];
            if (!product || qty <= 0) return;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <img class="cart-item__img" src="${product.img}" alt="${product.name}">
                <div class="cart-item__info">
                    <div class="cart-item__name">${product.name}</div>
                    <div class="cart-item__price">${product.price * qty} Kč</div>
                    <div class="cart-item__qty">
                        <button onclick="changeQty('${id}', -1)" aria-label="Ubrat">−</button>
                        <span>${qty}</span>
                        <button onclick="changeQty('${id}', 1)" aria-label="Přidat">+</button>
                    </div>
                </div>
                <button class="cart-item__remove" onclick="removeFromCart('${id}')" aria-label="Odebrat">×</button>
            `;
            cartItemsList.appendChild(li);
        });

        // Total
        cartTotalPrice.textContent = `${total} Kč`;

        // Shipping note
        if (total >= 599) {
            cartShippingNote.textContent = '🎉 Doprava zdarma!';
        } else {
            const remaining = 599 - total;
            cartShippingNote.textContent = `Přidejte zboží za ${remaining} Kč a máte dopravu zdarma.`;
        }
    }
}

// ---------- Filter Products ----------
function initFilters() {
    const filterBtns = document.querySelectorAll('.shop-filter-btn');
    const shopCards = document.querySelectorAll('.shop-card');
    const shopEmpty = document.getElementById('shop-empty');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            let visibleCount = 0;

            shopCards.forEach(card => {
                const cats = card.dataset.category || '';
                if (filter === 'all' || cats.includes(filter)) {
                    card.style.display = '';
                    card.style.animation = 'none';
                    // Trigger reflow for re-animation
                    void card.offsetWidth;
                    card.style.animation = 'fadeCardIn 0.4s ease forwards';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Show/hide empty state
            shopEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
        });
    });
}

// Inject card animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeCardIn {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ---------- Smooth scroll for hero CTA ----------
document.querySelector('.shop-btn-scroll')?.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('produkty');
    if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
});

// ---------- INIT ----------
renderCart();
initFilters();
