// ============================================
//  WILDERO SHOP – shop.js
// ============================================

// ---------- Product Catalogue ----------
let PRODUCTS = {};

// Supabase Init
const supabaseUrl = 'https://ttwyryduxqfssyetqhxw.supabase.co'.trim();
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0d3lyeWR1eHFmc3N5ZXRxaHh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzU1ODcsImV4cCI6MjA4MDExMTU4N30.FvW-ejXi8XC4juPYKZkW2lS0CL6ui8bmP9mJblxGvp8'.trim();
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Force scroll to top on refresh
if (window.location.hash) {
    window.history.replaceState(null, null, window.location.pathname);
}
window.scrollTo(0, 0);

// ---------- Cart State ----------
let cart = JSON.parse(localStorage.getItem('wildero_cart') || '{}');

// Helper to remove accents for filtering
function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

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

// ---------- Checkout Navigation ----------
function showCheckoutForm() {
    document.getElementById('cart-summary-step').style.display = 'none';
    const checkoutStep = document.getElementById('cart-checkout-step');
    if (checkoutStep) checkoutStep.style.display = 'block';
    const cartBody = document.getElementById('cart-body');
    if (cartBody) cartBody.style.display = 'none';
    const drawerTitle = document.querySelector('.cart-drawer__title');
    if (drawerTitle) drawerTitle.innerText = 'Doprava a platba';
}

function hideCheckoutForm() {
    document.getElementById('cart-summary-step').style.display = 'block';
    const checkoutStep = document.getElementById('cart-checkout-step');
    if (checkoutStep) checkoutStep.style.display = 'none';
    const cartBody = document.getElementById('cart-body');
    if (cartBody) cartBody.style.display = 'block';
    const drawerTitle = document.querySelector('.cart-drawer__title');
    if (drawerTitle) drawerTitle.innerText = '🛒 Váš košík';
}

function resetCartUI() {
    const summaryStep = document.getElementById('cart-summary-step');
    if (summaryStep) summaryStep.style.display = 'block';
    const checkoutStep = document.getElementById('cart-checkout-step');
    if (checkoutStep) checkoutStep.style.display = 'none';
    const successStep = document.getElementById('cart-success-step');
    if (successStep) successStep.style.display = 'none';
    const cartBody = document.getElementById('cart-body');
    if (cartBody) cartBody.style.display = 'block';
    const drawerTitle = document.querySelector('.cart-drawer__title');
    if (drawerTitle) drawerTitle.innerText = '🛒 Váš košík';
    const form = document.getElementById('checkout-form');
    if (form) form.reset();
}

async function submitOrder(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btn-order-submit');
    const originalText = btnSubmit.innerText;
    btnSubmit.disabled = true;
    btnSubmit.innerText = 'Odesílám...';
    
    const currentOrderItems = Object.entries(cart).map(([id, qty]) => {
        const p = PRODUCTS[id];
        return {
            id: id,
            qty: qty,
            price: p?.price || 0
        };
    });
    
    const totalPrice = currentOrderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    try {
        // Vyčistíme položky a ujistíme se, že jsou to čisté objekty
        const finalItems = Object.entries(cart).map(([id, qty]) => {
            const p = PRODUCTS[id];
            return {
                id: String(id),
                name: String(p?.name || 'Neznámý produkt'),
                qty: Number(qty),
                price: Number(p?.price || 0)
            };
        });

        const finalPayload = {
            customer_name: document.getElementById('cust-name').value,
            customer_email: document.getElementById('cust-email').value,
            customer_phone: document.getElementById('cust-phone').value,
            address: document.getElementById('cust-address').value,
            delivery_method: document.getElementById('cust-shipping').value,
            total_price: Number(totalPrice),
            items: finalItems, 
            status: 'new'
        };

        console.log("Odesílám (DEBUG payload):", JSON.stringify(finalPayload, null, 2));

        const { data, error } = await supabaseClient
            .from('orders')
            .insert([finalPayload]);
            
        if (error) {
            console.error("Supabase Error Object:", error);
            throw error;
        }
        
        // Úspěch
        cart = {};
        saveCart();
        renderCart();
        
        const checkoutStep = document.getElementById('cart-checkout-step');
        if (checkoutStep) checkoutStep.style.display = 'none';
        const successStep = document.getElementById('cart-success-step');
        if (successStep) successStep.style.display = 'block';
        const drawerTitle = document.querySelector('.cart-drawer__title');
        if (drawerTitle) drawerTitle.innerText = 'Vše v pořádku!';
        
    } catch (err) {
        console.error("Podrobná chyba Supabase při INSERTu:", err);
        const errDetail = err.message || err.details || JSON.stringify(err);
        
        // Formátujeme payload pro debug v alertu
        const finalPayloadDebug = {
            customer: document.getElementById('cust-name').value,
            items: Object.entries(cart).map(([id, qty]) => ({ id, qty }))
        };

        alert('CHYBA: ' + errDetail + '\n\nPayload: ' + JSON.stringify(finalPayloadDebug) + '\n\nOmlouváme se, objednávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nás kontaktujte.');
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'Zkusit znovu odeslat';
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

            const filter = slugify(btn.dataset.filter);
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

// ---------- Load Shop from Supabase ----------
async function loadShop() {
    try {
        const { data, error } = await supabaseClient.from('products').select('*').eq('status', 'active').order('created_at', { ascending: true });
        if (error) throw error;
        
        PRODUCTS = {};
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = '';
        
        data.forEach(p => {
            const productImages = Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []);
            
            PRODUCTS[p.id] = {
                name: p.title,
                price: p.price,
                img: productImages.length > 0 ? productImages[0] : 'shop_bag.png',
                desc: p.description,
                fullDesc: p.full_description,
                cat: slugify(p.category),
                stock: p.stock,
                images: productImages
            };
            
            const mainImg = PRODUCTS[p.id].img;
            const article = document.createElement('article');
            article.className = 'shop-card';
            article.dataset.category = PRODUCTS[p.id].cat;
            article.id = `product-${p.id}`;
            
            // Multiple image indicator
            const galleryBadge = productImages.length > 1 
                ? `<div class="shop-card__gallery-badge" title="Více fotografií">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                    <span>${productImages.length}</span>
                   </div>` 
                : '';

            article.innerHTML = `
                <div class="shop-card__img-wrap" style="cursor: pointer;" onclick="openProductModal('${p.id}')">
                    ${galleryBadge}
                    <img src="${mainImg}" alt="${p.title}" class="shop-card__img">
                    <div class="shop-card__overlay">
                        <button class="btn btn--primary" style="pointer-events: none;">Zobrazit detaily</button>
                    </div>
                </div>
                <div class="shop-card__body">
                    <span class="shop-card__cat">${p.category || 'Produkt'}</span>
                    <h2 class="shop-card__title" style="cursor: pointer;" onclick="openProductModal('${p.id}')">${p.title}</h2>
                    <p class="shop-card__desc">${p.description ? p.description.substring(0, 100) + '...' : ''}</p>
                    <div class="shop-card__footer">
                        <div class="shop-card__price">
                            <span class="shop-card__price-current">${p.price} Kč</span>
                        </div>
                        <button class="btn btn--primary shop-card__btn" onclick="addToCart('${p.id}')" id="btn-${p.id}">Koupit</button>
                    </div>
                </div>
            `;
            grid.appendChild(article);
        });
        
        initFilters(); // Musíme reinicializovat filtry po vytvoření DOM
        renderCart();  // Re-render košíku, protože tam může být staré ID
    } catch (err) {
        console.error("Chyba při načítání produktů ze Supabase:", err);
    }
}

// ---------- Product Modal Logic ----------
function openProductModal(id) {
    const p = PRODUCTS[id];
    if (!p) return;
    
    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-category').innerText = p.images.length > 1 ? `${p.cat} • Galerie` : p.cat;
    
    // Použijeme fullDesc pokud existuje, jinak desc
    const finalDesc = (p.fullDesc && p.fullDesc.trim() !== '') ? p.fullDesc : p.desc;
    document.getElementById('modal-desc').innerHTML = finalDesc ? finalDesc.replace(/\n/g, '<br>') : 'Tento produkt zatím nemá podrobný popis.';
    document.getElementById('modal-price').innerText = `${p.price} Kč`;
    
    // Logika zobrazení skladu podle rozsahu (obfuscace počtu kusů)
    const stockEl = document.getElementById('modal-stock-text');
    const stock = Number(p.stock) || 0;
    
    let stockLabel = "";
    if (stock <= 0) {
        stockLabel = "Není skladem";
        stockEl.style.color = "#e53e3e"; // Red for out of stock
    } else if (stock === 1) {
        stockLabel = "1 ks skladem";
        stockEl.style.color = "#718096";
    } else if (stock >= 2 && stock <= 5) {
        stockLabel = "3–5 kusů skladem"; // Grouping 2 into this bucket as requested for a general feel
        stockEl.style.color = "#718096";
    } else {
        stockLabel = "Víc jak 5 kusů skladem";
        stockEl.style.color = "#718096";
    }
    
    stockEl.innerText = stockLabel;
    
    // Reset a kontrola scrollování pro indikátor
    const descBox = document.getElementById('modal-desc');
    const indicator = document.getElementById('modal-scroll-indicator');
    const descWrap = document.querySelector('.product-modal__desc-wrap');
    
    descBox.scrollTop = 0;
    
    setTimeout(() => {
        const hasOverflow = descBox.scrollHeight > descBox.clientHeight;
        indicator.style.display = hasOverflow ? 'flex' : 'none';
        
        // Přidání třídy pro fade-out efekt pouze při overflow
        if (hasOverflow) {
            descWrap.classList.add('has-overflow');
        } else {
            descWrap.classList.remove('has-overflow');
        }
    }, 50);
    
    descBox.onscroll = () => {
        const isBottom = descBox.scrollHeight - descBox.scrollTop <= descBox.clientHeight + 20;
        indicator.style.opacity = isBottom ? '0' : '0.8';
        indicator.style.pointerEvents = 'none';
    };
    
    document.getElementById('modal-add-cart').onclick = () => {
        addToCart(id);
        closeProductModal();
    };
    
    const mainImg = document.getElementById('modal-main-img');
    const thumbsContainer = document.getElementById('modal-thumbnails');
    
    mainImg.src = p.images.length > 0 ? p.images[0] : 'public/placeholder.png';
    thumbsContainer.innerHTML = '';
    
    if (p.images.length > 1) {
        p.images.forEach((imgUrl, i) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.className = 'product-modal-thumb' + (i === 0 ? ' active' : '');
            thumb.onclick = () => {
                mainImg.src = imgUrl;
                document.querySelectorAll('.product-modal-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            };
            thumbsContainer.appendChild(thumb);
        });
        
        // Zobrazení šipek pokud je více než 4 obrázky (nebo dle potřeby)
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');
        if (prevBtn && nextBtn) {
            if (p.images.length > 1) {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            } else {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }
        }
    } else {
        const prevBtn = document.getElementById('modal-prev');
        const nextBtn = document.getElementById('modal-next');
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    }
    
    document.getElementById('product-detail-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
    document.body.style.overflow = '';
}

// Umožní zavřít modál kliknutím mimo obsah
document.getElementById('product-detail-modal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// Ovládání šipek galerie
document.getElementById('modal-prev')?.addEventListener('click', () => {
    const container = document.getElementById('modal-thumbnails');
    container.scrollBy({ left: -100, behavior: 'smooth' });
});

document.getElementById('modal-next')?.addEventListener('click', () => {
    const container = document.getElementById('modal-thumbnails');
    container.scrollBy({ left: 100, behavior: 'smooth' });
});

// ---------- INIT ----------
loadShop();
