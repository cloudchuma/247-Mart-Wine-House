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

    // NEW DOM ELEMENTS FOR WELCOME POPOVER
    const bonusModal = document.getElementById("bonus-modal");
    const bonusForm = document.getElementById("bonus-form");
    const btnCloseBonus = document.getElementById("btn-close-bonus");

    // ⚠️ Replace with your real WhatsApp business number (international, no +).
    const BUSINESS_PHONE = "2348000000000";

    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Age verification & Welcome Bonus Sequence ---------- */
    const triggerBonusPopupDelayed = () => {
        if (localStorage.getItem("bonusClaimedOrDismissed") !== "true") {
            setTimeout(() => {
                if (bonusModal) {
                    bonusModal.style.display = "flex";
                    bonusModal.style.opacity = "1";
                    document.body.style.overflow = "hidden";
                }
            }, 1500); // Trigger 1.5 seconds after passing the age gate
        }
    };

    const dismissBonus = () => {
        localStorage.setItem("bonusClaimedOrDismissed", "true");
        if (bonusModal) {
            bonusModal.style.opacity = "0";
            document.body.style.overflow = "";
            setTimeout(() => { bonusModal.style.display = "none"; }, 360);
        }
    };

    if (ageModal) {
        if (localStorage.getItem("ageVerified") === "true") {
            ageModal.style.display = "none";
            triggerBonusPopupDelayed();
        } else {
            document.body.style.overflow = "hidden";
        }

        const closeAgeModal = () => {
            ageModal.style.transition = "opacity 0.35s ease";
            ageModal.style.opacity = "0";
            document.body.style.overflow = "";
            setTimeout(() => {
                ageModal.style.display = "none";
                triggerBonusPopupDelayed();
            }, 360);
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

    /* ---------- Welcome Bonus Interactive Inputs ---------- */
    btnCloseBonus?.addEventListener("click", dismissBonus);

    bonusForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailCaptured = document.getElementById("bonus-email")?.value;
        alert(`🎁 Promo Code [BUYMORE5] applied! 5% discount unlocked for ${emailCaptured}.`);
        localStorage.setItem("userPromoDiscountApplied", "true");
        dismissBonus();
        updateCartUI(); // Instant update to check for items already in cart
    });

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

        let subtotal = 0, count = 0;
        cart.forEach(item => {
            const line = item.price * item.quantity;
            subtotal += line;
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

        // Compute 5% promotional reductions dynamically if subscriber gate clears
        let finalGrandTotal = subtotal;
        if (localStorage.getItem("userPromoDiscountApplied") === "true") {
            const deductionAmount = subtotal * 0.05;
            finalGrandTotal = subtotal - deductionAmount;

            // Render an itemized deduction break notice to the sidebar total summary matrix
            const discountRow = document.createElement("div");
            discountRow.className = "cart-discount-notice";
            discountRow.innerHTML = `<p style="color: #4ade80; font-size: 0.85rem; text-align: right; margin-bottom: 5px;">Promo Code Applied: -${fmt(deductionAmount)} (5% Off)</p>`;
            cartItemsContainer.appendChild(discountRow);
        }

        cartTotalPrice.textContent = fmt(finalGrandTotal);
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

    /* ---------- Checkout Form Submission to WhatsApp ---------- */
    checkoutForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("cust-name")?.value || "Customer";
        const phone = document.getElementById("cust-phone")?.value || "Not Provided";
        const zoneSelect = document.getElementById("delivery-zone");
        const selectedZoneName = zoneSelect ? zoneSelect.options[zoneSelect.selectedIndex].text : "Azikiwe Road Center";
        const address = document.getElementById("cust-address")?.value || "Pick Up At Store";

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        let message = `*🔔 NEW 24/7 SHOPPING ORDER* \n\n`;
        message += `*Customer Details:* \n`;
        message += `👤 Name: ${name}\n`;
        message += `📞 Phone: ${phone}\n`;
        message += `📍 Zone Area: ${selectedZoneName}\n`;
        message += `🏠 Landmark Address: ${address}\n\n`;
        message += `*Items Ordered:* \n`;

        let subtotal = 0;
        cart.forEach(item => {
            message += `- ${item.quantity}x ${item.name} (${fmt(item.price * item.quantity)})\n`;
            subtotal += item.price * item.quantity;
        });

        let finalGrandTotal = subtotal;
        if (localStorage.getItem("userPromoDiscountApplied") === "true") {
            const deductionAmount = subtotal * 0.05;
            finalGrandTotal = subtotal - deductionAmount;
            message += `\n🎁 Slogan Discount Applied: -${fmt(deductionAmount)} (5% Off)\n`;
        }

        message += `💰 *Grand Total Bill: ${fmt(finalGrandTotal)}* \n\n`;
        message += `Slogan check: "Buy more, pay less..."\n`;
        message += `Please confirm availability and dispatch your closest rider from Azikiwe Road!`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me{BUSINESS_PHONE}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Fire native canvas confetti logic routines
        fireConfetti();

        // Reset local workspace states
        cart = [];
        checkoutForm.reset();
        updateCartUI();
        closeCart();
    });

    /* ---------- Confetti + checkmark success ---------- */
    function fireConfetti() {
        if (!confettiCanvas) return;
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
        }));

        let animationFrameId;
        const updateConfetti = () => {
            ctx.clearRect(0, 0, W, H);
            let active = false;
            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.g;
                p.rot += p.vr;
                if (p.y < H + 20) active = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
            if (active) {
                animationFrameId = requestAnimationFrame(updateConfetti);
            } else {
                cancelAnimationFrame(animationFrameId);
            }
        };
        updateConfetti();
    }
});
