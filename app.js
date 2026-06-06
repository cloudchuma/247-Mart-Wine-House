document.addEventListener("DOMContentLoaded", () => {
    /* ---------- DOM ---------- */
    const ageModal = document.getElementById("age-modal");
    const btnEnter = document.getElementById("btn-enter");
    const btnLeave = document.getElementById("btn-leave");
    const navbar = document.getElementById("navbar");
    const cartCount = document.getElementById("cart-count");
    const cartBtn = document.getElementById("cart-btn");
    const yearEl = document.getElementById("year");

    const cartSidebar = document.getElementById("cart-sidebar");
    const closeCartBtn = document.getElementById("close-cart");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const checkoutForm = document.getElementById("checkout-form");
    const orderSuccess = document.getElementById("order-success");
    const confettiCanvas = document.getElementById("confetti-canvas");

    // ⚠️ Replace with your real WhatsApp business number (international, no +).
    const BUSINESS_PHONE = "2348000000000";

    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Age verification ---------- */
    if (ageModal) {
        if (localStorage.getItem("ageVerified") === "true") {
            ageModal.style.display = "none";
        } else {
            document.body.style.overflow = "hidden";
        }
        const closeAgeModal = () => {
            ageModal.style.transition = "opacity 0.35s ease";
            ageModal.style.opacity = "0";
            document.body.style.overflow = "";
            setTimeout(() => { ageModal.style.display = "none"; }, 360);
        };
        btnEnter?.addEventListener("click", () => {
            localStorage.setItem("ageVerified", "true");
            closeAgeModal();
        });
        btnLeave?.addEventListener("click", () => {
            alert("You must be 18 or older to view this site.");
            window.location.href = "https://google.com";
        });
    }

    /* ---------- Navbar scroll state ---------- */
    if (navbar) {
        const onScroll = () => {
            if (window.scrollY > 12) navbar.classList.add("scrolled");
            else navbar.classList.remove("scrolled");
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Smooth in-page links ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href");
            if (!id || id === "#") return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    /* ---------- Cart state ---------- */
    let cart = [];

    const fmt = (n) => "₦" + n.toLocaleString();

    const openCart = () => {
        cartSidebar.classList.add("active");
        sidebarOverlay.classList.add("active");
        cartSidebar.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };
    const closeCart = () => {
        cartSidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
        cartSidebar.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };
    const toggleCart = () => cartSidebar.classList.contains("active") ? closeCart() : openCart();

    cartBtn?.addEventListener("click", toggleCart);
    closeCartBtn?.addEventListener("click", closeCart);
    sidebarOverlay?.addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && cartSidebar.classList.contains("active")) closeCart();
    });

    const bumpCart = () => {
        if (!cartCount) return;
        cartCount.classList.remove("bump");
        void cartCount.offsetWidth;
        cartCount.classList.add("bump");
    };

    function updateCartUI() {
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <p class="empty-cart-msg">
                    <i class="fa-solid fa-wine-glass-empty empty-icon"></i>
                    Your cart is empty.<br>
                    <span>Let's add some premium bottles!</span>
                </p>`;
            cartTotalPrice.textContent = fmt(0);
            cartCount.textContent = "0";
            return;
        }

        let total = 0, count = 0;
        cart.forEach(item => {
            const line = item.price * item.quantity;
            total += line;
            count += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} × ${fmt(item.price)} <span class="line-total">· ${fmt(line)}</span></p>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartTotalPrice.textContent = fmt(total);
        cartCount.textContent = String(count);
        bumpCart();
    }

    // Qty controls (event delegation)
    cartItemsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;
        const id = parseInt(btn.dataset.id, 10);
        const action = btn.dataset.action;
        const item = cart.find(i => i.id === id);
        if (!item) return;
        if (action === "inc") item.quantity += 1;
        else if (action === "dec") {
            item.quantity -= 1;
            if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        }
        updateCartUI();
    });

    /* ---------- Add to cart from product grid ---------- */
    document.querySelectorAll(".btn-add").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const id = parseInt(btn.dataset.id, 10);
            const name = btn.dataset.name;
            const price = parseInt(btn.dataset.price, 10);
            if (!id || !name || !price) return;

            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity += 1;
            else cart.push({ id, name, price, quantity: 1 });

            updateCartUI();
            openCart();

            const original = btn.textContent;
            btn.textContent = "Added ✓";
            btn.style.opacity = "0.85";
            setTimeout(() => { btn.textContent = original; btn.style.opacity = ""; }, 1100);
        });
    });

    /* ---------- Confetti + checkmark success ---------- */
    function fireConfetti() {
        const ctx = confettiCanvas.getContext("2d");
        const dpr = window.devicePixelRatio || 1;
        const W = confettiCanvas.clientWidth = window.innerWidth;
        const H = confettiCanvas.clientHeight = window.innerHeight;
        confettiCanvas.width = W * dpr;
        confettiCanvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        const colors = ["#d4af37", "#f3cf55", "#25d366", "#ffffff", "#a8861f", "#4ade80"];
        const pieces = Array.from({ length: 140 }, () => ({
            x: W / 2 + (Math.random() - 0.5) * 80,
            y: H / 2 + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 12,
            vy: Math.random() * -14 - 4,
            g: 0.35 + Math.random() * 0.2,
            size: 6 + Math.random() * 6,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 0
        }));

        let raf;
        const start = performance.now();
        function tick(now) {
            const t = now - start;
            ctx.clearRect(0, 0, W, H);
            pieces.forEach(p => {
                p.vy += p.g;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;
                p.life = t;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, 1 - t / 2400);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
                ctx.restore();
            });
            if (t < 2400) raf = requestAnimationFrame(tick);
            else ctx.clearRect(0, 0, W, H);
        }
        raf = requestAnimationFrame(tick);
    }

    function showSuccess() {
        orderSuccess.classList.add("active");
        orderSuccess.setAttribute("aria-hidden", "false");
        fireConfetti();
        setTimeout(() => {
            orderSuccess.classList.remove("active");
            orderSuccess.setAttribute("aria-hidden", "true");
        }, 2200);
    }

    /* ---------- Checkout → WhatsApp ---------- */
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (cart.length === 0) { alert("Your cart is empty!"); return; }

        const name = document.getElementById("cust-name").value.trim();
        const phone = document.getElementById("cust-phone").value.trim();
        const address = document.getElementById("cust-address").value.trim();
        if (!name || !phone || !address) {
            alert("Please fill in your name, phone and delivery address.");
            return;
        }

        let total = 0;
        let lines = "";
        cart.forEach(item => {
            const sub = item.price * item.quantity;
            total += sub;
            lines += `• ${item.quantity}× ${item.name} — ${fmt(sub)}\n`;
        });

        const message =
            `*🔔 NEW 24/7 WINE & MART ORDER*\n\n` +
            `*Customer*\n` +
            `👤 ${name}\n` +
            `📞 ${phone}\n` +
            `📍 ${address}\n\n` +
            `*Items*\n${lines}\n` +
            `💰 *Total: ${fmt(total)}*\n\n` +
            `Please confirm availability and dispatch the closest rider from Azikiwe Road. Thank you!`;

        const url = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;

        showSuccess();
        // small delay so the user sees the confetti before the tab switches
        setTimeout(() => { window.open(url, "_blank"); }, 700);

        cart = [];
        checkoutForm.reset();
        updateCartUI();
        setTimeout(closeCart, 1600);
    });

    updateCartUI();
});
