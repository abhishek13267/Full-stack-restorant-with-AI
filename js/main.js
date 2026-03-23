import { getMenu } from './data.js';

document.addEventListener('DOMContentLoaded', async () => {
    /* 0. Configuration & Global State
    ------------------------------------ */
    const CONFIG = {
        PAYPAL_CLIENT_ID: 'sb', // Use 'sb' for sandbox, or your real Client ID
        CURRENCY: 'USD',         // Change to 'INR' if using Indian Rupees
        API_BASE: 'http://localhost:5001/api'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    let cart = []; 
    let menuDataGlobal = [];
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-modal');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountBadge = document.getElementById('cart-count');
    const cartSubtotalField = document.getElementById('cart-subtotal');
    const checkoutCartBtn = document.getElementById('checkout-cart-btn');

    /* 0.1 Home Page "Instant Wake Up"
    ------------------------------------ */
    // Ensure anything that IS NOT scrolling-based starts active 
    // to avoid the "Blank Home Page" if the observer is delayed.
    document.querySelectorAll('.hero-content, .about-img').forEach(el => el.classList.add('active'));

    /* 0.2 Cart Functions
    ------------------------------------ */
    const updateCartUI = () => {
        if (!cartCountBadge) return;
        cartCountBadge.innerText = cart.length;
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your selection is currently empty. 🥘</p>';
            cartSubtotalField.innerText = '$0.00';
            if (checkoutCartBtn) checkoutCartBtn.disabled = true;
            return;
        }

        if (checkoutCartBtn) checkoutCartBtn.disabled = false;
        cart.forEach((item, index) => {
            const priceStr = item.price || "$0.00";
            const price = parseFloat(priceStr.replace(/[$,\s]/g, '')) || 0;
            subtotal += price;

            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                </div>
                <div class="cart-item-actions">
                    <span class="remove-item" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></span>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
        cartSubtotalField.innerText = `$${subtotal.toFixed(2)}`;
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    const addToCart = (item) => {
        cart.push(item);
        updateCartUI();
        if (cartCountBadge) {
            cartCountBadge.classList.add('shake');
            setTimeout(() => cartCountBadge.classList.remove('shake'), 400);
        }

        // Show a "wow" toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background: linear-gradient(135deg, var(--primary), #ae6b0a);
            color: white; padding: 1rem 2rem; border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.2); 
            z-index: 10000; animation: slideUp 0.5s ease;
            font-weight: 700; display: flex; align-items: center; gap: 10px;
        `;
        toast.innerHTML = `<i class="fas fa-check-circle"></i> Added to Selection!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.transform = 'translateY(100px)', 2500);
        setTimeout(() => toast.remove(), 3000);
    };

    /* 1. Ultra-Stable Payment Modal
    ------------------------------------ */
    const openPaymentModal = (item) => {
        const paymentModal = document.getElementById('payment-modal');
        if(!paymentModal) return;

        // Reset Views
        document.getElementById('receipt-container').style.display = 'none';
        document.getElementById('payment-loader').style.display = 'none';
        document.querySelector('.checkout-summary').style.display = 'flex';
        document.querySelector('.payment-selection-container').style.display = 'block';
        document.querySelector('.payment-tabs').style.display = 'flex';
        const cardView = document.getElementById('card-payment');
        const upiView = document.getElementById('upi-payment');
        if(cardView) cardView.style.display = 'block';
        if(upiView) upiView.style.display = 'none';

        // Reset Tabs Style
        document.querySelectorAll('.payment-tab').forEach(t => {
            t.style.color = '#888';
            t.style.borderBottom = 'none';
            if(t.getAttribute('data-target') === 'card-payment') {
                t.style.color = 'var(--primary)';
                t.style.borderBottom = '3px solid var(--primary)';
            }
        });

        // Set Order Info
        document.getElementById('checkout-name').innerText = item.name || 'Gourmet Selection';
        document.getElementById('checkout-price').innerText = item.price || '$0.00';
        const checkImg = document.getElementById('checkout-img');
        if(checkImg) {
            checkImg.src = item.img || 'images/img/img-3.jpg';
        }
        paymentModal.classList.add('active');

        const processPaymentComplete = (payerName, billID) => {
            document.querySelectorAll('.payment-view').forEach(v => v.style.display = 'none');
            document.querySelector('.payment-selection-container').style.display = 'none';
            document.querySelector('.payment-tabs').style.display = 'none';
            document.getElementById('payment-loader').style.display = 'block';

            setTimeout(() => {
                const finalTxnID = billID || 'TRAX' + Math.random().toString(36).substr(2, 9).toUpperCase();
                document.querySelector('.checkout-summary').style.display = 'none';
                document.getElementById('receipt-container').style.display = 'block';
                document.getElementById('payment-loader').style.display = 'none';
                
                const mContent = document.querySelector('#payment-modal .modal-content');
                if(mContent) mContent.scrollTo(0, 0);

                const orderDate = new Date().toLocaleString();
                const txnElement = document.getElementById('r-txn-id');
                if (txnElement) txnElement.innerText = finalTxnID;
                
                document.getElementById('r-date').innerText = orderDate;
                document.getElementById('r-amount').innerText = item.price;
                document.getElementById('r-payer').innerText = payerName;

                // POST TO BACKEND
                fetch(`${CONFIG.API_BASE}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: finalTxnID, payerName, amount: item.price, item: item.name })
                }).catch(e => console.error('API Error:', e));

                // Clear Global App Cart State
                cart = [];
                updateCartUI();

                // Build TXT Bill Content
                const bTxt = `========================================\n         SAFFRON & SAGE BILL\n========================================\nOrder ID: #${finalTxnID.slice(-8)}\nDate: ${orderDate}\nCustomer: ${payerName}\n----------------------------------------\nSelection: ${item.name}\nTotal Paid: ${item.price}\nStatus: COMPLETED\n----------------------------------------\nVisit again: www.saffronsage.com\n========================================`.trim();
                
                const dBtn = document.getElementById('download-receipt');
                if(dBtn) dBtn.onclick = () => {
                    const blob = new Blob([bTxt], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `SaffronSage_Invoice_${finalTxnID.slice(-4)}.txt`;
                    a.click(); URL.revokeObjectURL(url);
                };

                const pBtn = document.getElementById('print-receipt');
                if(pBtn) pBtn.onclick = () => {
                    const win = window.open('', '_blank', 'width=600,height=600');
                    win.document.write(`<pre style="font-family:monospace;padding:20px;font-size:14px;">${bTxt}</pre>`);
                    win.document.close();
                    setTimeout(() => { win.focus(); win.print(); }, 500);
                };

                const closeRBtn = document.getElementById('receipt-cancel-btn');
                if(closeRBtn) closeRBtn.onclick = () => paymentModal.classList.remove('active');
            }, 1500);
        };

        // PayPal Buttons Integration
        const ppBox = document.getElementById('paypal-button-container');
        if(window.paypal && ppBox) {
            ppBox.innerHTML = ''; // Clear previous button
            window.paypal.Buttons({
                style: { 
                    layout: 'vertical', 
                    color: 'gold', 
                    shape: 'rect',
                    label: 'paypal'
                },
                createOrder: (data, actions) => {
                    const cleanPrice = item.price.replace(/[$,\s]/g, '') || "0.00";
                    return actions.order.create({
                        purchase_units: [{ 
                            amount: { 
                                value: cleanPrice, 
                                currency_code: CONFIG.CURRENCY 
                            }, 
                            description: `Saffron Selection: ${item.name.substring(0, 100)}` 
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then(details => {
                        const payerName = details.payer.name.given_name + ' ' + details.payer.name.surname;
                        processPaymentComplete(payerName, details.id);
                    });
                },
                onError: (err) => {
                    console.error('PayPal Error:', err);
                    alert('There was an issue with the PayPal connection. Please try again or use another method.');
                }
            }).render('#paypal-button-container');
        }

        // Card Form
        const mForm = document.getElementById('mock-payment-form');
        if(mForm) mForm.onsubmit = (e) => {
            e.preventDefault();
            processPaymentComplete(document.getElementById('card-name').value || 'Guest Member');
        };

        // UPI Submit
        const uBtn = document.getElementById('upi-verify-btn');
        if(uBtn) uBtn.onclick = () => {
            const upid = document.getElementById('upi-trax-id').value;
            if(!upid) return alert('Enter UPI Ref ID');
            processPaymentComplete('UPI Customer', upid);
        };

        // Tab Switching
        document.querySelectorAll('.payment-tab').forEach(tab => {
            tab.onclick = () => {
                const target = tab.getAttribute('data-target');
                document.querySelectorAll('.payment-view').forEach(v => v.style.display = 'none');
                document.getElementById(target).style.display = 'block';
                document.querySelectorAll('.payment-tab').forEach(t => {
                    t.style.color = '#888';
                    t.style.borderBottom = 'none';
                });
                tab.style.color = 'var(--primary)';
                tab.style.borderBottom = '3px solid var(--primary)';
            };
        });
    };

    /* 2. Menu Rendering (High performance)
    ------------------------------------ */
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        menuDataGlobal = await getMenu();
        if (menuDataGlobal.length === 0) {
            menuContainer.innerHTML = '<div class="text-center w-100 p-4"><p>Preparing our finest dishes... Please refresh in a moment. 🧑‍🍳</p></div>';
        } else {
            menuContainer.innerHTML = menuDataGlobal.map(item => `
                <div class="menu-card reveal">
                    <div class="menu-img-wrapper"><img src="${item.img}" alt="${item.name}"></div>
                    <div class="menu-info">
                        <h3>${item.name}</h3>
                        <p class="menu-meta">Time: ${item.time} | Serves: ${item.serves}</p>
                        <div class="menu-price"><span class="price-current">${item.priceCurrent}</span> <span class="price-old">${item.priceOld}</span></div>
                        <button class="btn btn-primary w-100 order-trigger">Order Now</button>
                    </div>
                </div>
            `).join('');

            // CRITICAL: Force dynamic observe call
            document.querySelectorAll('.menu-card.reveal').forEach(el => revealObserver.observe(el));
            
            // Bind Order Triggers
            document.querySelectorAll('.order-trigger').forEach(btn => {
                btn.onclick = () => {
                    const card = btn.closest('.menu-card');
                    const item = {
                        name: card.querySelector('h3').innerText,
                        price: card.querySelector('.price-current').innerText,
                        img: card.querySelector('img').src
                    };
                    
                    // Add to cart for record
                    addToCart(item);
                    
                    // Directly open payment modal for this item
                    openPaymentModal(item);
                };
            });
        }
        updateCartUI();
    }

    // Global Interactions
    if(cartToggle) cartToggle.onclick = () => cartModal.classList.add('active');
    if(closeCartBtn) closeCartBtn.onclick = () => cartModal.classList.remove('active');

    // Philosophy Modal
    const philBtn = document.getElementById('open-philosophy-btn');
    const philModal = document.getElementById('philosophy-modal');
    if(philBtn) philBtn.onclick = () => philModal.classList.add('active');
    if(philModal) {
        document.getElementById('close-philosophy').onclick = () => philModal.classList.remove('active');
        document.getElementById('close-philosophy-btn').onclick = () => philModal.classList.remove('active');
    }

    // Sourcing Modal
    const sourceBtn = document.getElementById('open-sourcing');
    const sourceModal = document.getElementById('sourcing-modal');
    if(sourceBtn) sourceBtn.onclick = () => sourceModal.classList.add('active');
    if(sourceModal) {
        document.getElementById('close-sourcing').onclick = () => sourceModal.classList.remove('active');
        document.getElementById('close-sourcing-btn').onclick = () => sourceModal.classList.remove('active');
    }

    // Craft Modal
    const craftBtn = document.getElementById('open-craft');
    const craftModal = document.getElementById('craft-modal');
    if(craftBtn) craftBtn.onclick = () => craftModal.classList.add('active');
    if(craftModal) {
        document.getElementById('close-craft').onclick = () => craftModal.classList.remove('active');
        document.getElementById('close-craft-btn').onclick = () => craftModal.classList.remove('active');
    }

    if (checkoutCartBtn) {
        checkoutCartBtn.onclick = () => {
            const sbt = cartSubtotalField.innerText;
            const names = cart.map(i => i.name).join(', ');
            openPaymentModal({ name: names, price: sbt });
            cartModal.classList.remove('active');
        };
    }

    // Contact Form
    const conForm = document.getElementById('contact-form');
    if (conForm) {
        conForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const origRes = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            const pack = {
                name: document.getElementById('con-name').value,
                email: document.getElementById('con-email').value,
                message: document.getElementById('con-message').value
            };
            try {
                const r = await fetch(`${CONFIG.API_BASE}/contacts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(pack)
                });
                if(r.ok) { alert('Thank you! Your inquiry is received.'); conForm.reset(); }
            } catch(ex) { alert('Connection Error.'); }
            btn.innerHTML = origRes;
        };
    }

    // Payment Close
    const payClose = document.getElementById('close-modal');
    if(payClose) {
        payClose.onclick = () => {
             const rcpt = document.getElementById('receipt-container');
             if(rcpt && rcpt.style.display === 'block') {
                 if(confirm("Discard Receipt and Close?")) document.getElementById('payment-modal').classList.remove('active');
             } else {
                 document.getElementById('payment-modal').classList.remove('active');
             }
        };
    }

    /* 4. AI Chat Assistant (Optimized)
    ------------------------------------ */
    const aiBubble = document.getElementById('ai-chat-bubble');
    const aiModal = document.getElementById('ai-chat-modal');
    const aiClose = document.getElementById('close-ai-chat');
    const aiMessages = document.getElementById('ai-messages');
    const aiInput = document.getElementById('ai-input');
    const aiSend = document.getElementById('ai-send');
    const chips = document.querySelectorAll('.suggestion-chip');

    if(aiBubble) aiBubble.onclick = () => aiModal.classList.add('active');
    if(aiClose) aiClose.onclick = () => aiModal.classList.remove('active');

    const addAI = (t, s) => {
        const d = document.createElement('div');
        d.className = `message ${s}`;
        d.innerHTML = `<p>${t}</p>`;
        aiMessages.appendChild(d);
        aiMessages.scrollTo(0, aiMessages.scrollHeight);
    }

    const askAI = async (q) => {
        if(!q.trim()) return;
        addAI(q, 'user');
        aiInput.value = '';
        const typ = document.createElement('div');
        typ.className = 'message ai'; typ.innerHTML = '<p>...</p>';
        aiMessages.appendChild(typ);
        
        setTimeout(() => {
            typ.remove();
            let r = "I'm the Saffron Concierge. How can I delight you?";
            const l = q.toLowerCase();
            const m = menuDataGlobal.find(i => l.includes(i.name.toLowerCase()));
            if(m) r = `Absolutely! The **${m.name}** is a masterpiece priced at ${m.priceCurrent}. Our patrons love it!`;
            else if(l.includes('hello') || l.includes('hi')) r = "Namaste! Welcome to Saffron & Sage. Feel free to ask for spicy recommendations!";
            else if(l.includes('spicy')) r = "Our Peri-Peri specials are perfect if you love heat! 🔥";
            addAI(r, 'ai');
        }, 800);
    }

    if(aiSend) aiSend.onclick = () => askAI(aiInput.value);
    if(aiInput) aiInput.onkeypress = (e) => { if(e.key === 'Enter') askAI(aiInput.value); };
    chips.forEach(c => c.onclick = () => askAI(c.innerText));

    /* 5. Dynamic Counters
    ------------------------------------ */
    const statsSect = document.querySelector('.stats');
    const animateC = (id, end) => {
        const o = document.getElementById(id);
        if (!o) return;
        const dur = 2000;
        const startT = performance.now();
        const tick = (now) => {
            const prog = Math.min((now - startT) / dur, 1);
            o.innerText = Math.floor(prog * end);
            if (prog < 1) window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
    };

    const statsObs = new IntersectionObserver((es) => {
        if (es[0].isIntersecting) {
            animateC('count1', 1263); animateC('count2', 1000);
            animateC('count3', 1754); animateC('count4', 953);
            statsObs.unobserve(statsSect);
        }
    }, { threshold: 0.5 });
    if (statsSect) statsObs.observe(statsSect);

    // --- 6. Testimonial Slider ---
    const slides = document.querySelectorAll('#testimonial-slider .slide');
    const dots = document.querySelectorAll('#slider-dots .dot');
    const showSlide = (n) => {
        if(slides.length === 0) return;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        let current = (n + slides.length) % slides.length;
        if(slides[current]) slides[current].classList.add('active');
        if(dots[current]) dots[current].classList.add('active');
    };
    dots.forEach((dot, i) => dot.onclick = () => showSlide(i));

    setInterval(() => {
        const activeIdx = Array.from(dots).findIndex(d => d.classList.contains('active'));
        if(activeIdx !== -1) showSlide(activeIdx + 1);
    }, 5000);

    // --- FINAL WAKE UP CALL ---
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
});