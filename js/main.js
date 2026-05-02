/**
 * APN Food Products - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. WhatsApp Order Configuration
    const phoneNumber = "919605235235"; // Updated to actual business number

    // Global WhatsApp function for hero buttons
    window.openWhatsApp = () => {
        const generalMsg = encodeURIComponent("Hi APN Food Products! I'd like to know more about your products and place an order.");
        const waUrl = `https://wa.me/${phoneNumber}?text=${generalMsg}`;
        window.open(waUrl, '_blank');
    };

    // 2. Cart Management
    let cart = JSON.parse(localStorage.getItem('apnCart')) || [];

    const updateCartBadge = () => {
        const badge = document.getElementById('cart-badge');
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalQty;
    };

    const updateCartUI = () => {
        const cartItemsDiv = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartSummary = document.getElementById('cart-summary');

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '';
            cartEmpty.style.display = 'flex';
            cartSummary.style.display = 'none';
            return;
        }

        cartEmpty.style.display = 'none';
        cartSummary.style.display = 'block';

        cartItemsDiv.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" class="cart-item-img">` : ''}
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                </div>
                <div class="cart-item-qty">
                    <button onclick="decreaseQty(${index})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseQty(${index})">+</button>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
            </div>
        `).join('');

        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalQty >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        document.getElementById('cart-subtotal').textContent = `₹${subtotal}`;
        document.getElementById('cart-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
        document.getElementById('cart-total-price').textContent = `₹${total}`;
    };

    // Global functions for cart operations
    window.increaseQty = (index) => {
        cart[index].quantity++;
        localStorage.setItem('apnCart', JSON.stringify(cart));
        updateCartBody();
    };

    window.decreaseQty = (index) => {
        if (cart[index].quantity > 1) {
            cart[index].quantity--;
            localStorage.setItem('apnCart', JSON.stringify(cart));
            updateCartBody();
        }
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        localStorage.setItem('apnCart', JSON.stringify(cart));
        updateCartBody();
    };

    const updateCartBody = () => {
        updateCartUI();
        updateCartBadge();
    };

    // Add to Cart Button Handler
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = btn.getAttribute('data-product');
            const price = parseInt(btn.getAttribute('data-price'));
            const quantityDisplay = btn.closest('.product-info').querySelector('.qty-display');
            const quantity = parseInt(quantityDisplay.textContent);

            const productCard = btn.closest('.product-card') || btn.closest('.slide');
            let imgSrc = '';
            if (productCard) {
                const img = productCard.querySelector('img');
                if (img) imgSrc = img.getAttribute('src');
            }

            // Check if product already in cart
            const existingItem = cart.find(item => item.name === productName);

            if (existingItem) {
                existingItem.quantity += quantity;
                if (!existingItem.image && imgSrc) existingItem.image = imgSrc;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: quantity,
                    image: imgSrc
                });
            }

            localStorage.setItem('apnCart', JSON.stringify(cart));
            updateCartBody();

            // Show feedback
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 1500);
        });
    });

    // Cart Modal Controls
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');

    const openCart = () => {
        cartModal.classList.add('active');
        cartOverlay.classList.add('active');
        updateCartUI();
    };

    const closeCart = () => {
        cartModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Checkout Transition
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        // Hide cart modal
        cartModal.classList.remove('active');

        // Populate Checkout Summary
        const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalQty >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        document.getElementById('checkout-subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
        document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`;
        document.getElementById('checkout-total').textContent = `Rs. ${total.toFixed(2)}`;

        // Show checkout modal
        setTimeout(() => {
            checkoutModal.classList.add('active');
        }, 300);
    });

    closeCheckoutBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    });

    // Remaining Cart Logic for Direct Buy
    const formatWhatsAppMsg = (productName, quantity = 1, price = 0) => {
        const subtotal = quantity * price;
        const shipping = quantity >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        const text = `New Order 🛒\n\n` +
            `Order Details:\n` +
            `1. Product: ${productName}\n` +
            `   Qty: ${quantity}\n` +
            `   Price: ₹${price}\n\n` +
            `-----------------------\n` +
            `Subtotal: ₹${subtotal}\n` +
            `Shipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}\n` +
            `Total: ₹${total}\n\n` +
            `Please confirm my order and share details.`;

        return encodeURIComponent(text);
    };

    // 3. Quantity Control Handler
    const quantityBtns = document.querySelectorAll('.qty-btn');

    quantityBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const selector = btn.closest('.quantity-selector');
            const display = selector.querySelector('.qty-display');
            let quantity = parseInt(display.textContent);

            if (btn.classList.contains('qty-plus')) {
                quantity++;
            } else if (btn.classList.contains('qty-minus') && quantity > 1) {
                quantity--;
            }

            display.textContent = quantity;
        });
    });

    // 4. Buy Now Buttons Event Listener
    const buyButtons = document.querySelectorAll('.buy-btn');
    let directBuyItem = null;

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-product');
            const price = parseInt(e.target.getAttribute('data-price'));

            const quantityDisplay = e.target.closest('.product-info').querySelector('.qty-display');
            const quantity = parseInt(quantityDisplay.textContent);

            if (productName) {
                // Store item for checkout
                directBuyItem = {
                    name: productName,
                    quantity: quantity,
                    price: price
                };

                // Populate Checkout Summary for this single item
                const subtotal = quantity * price;
                const shipping = quantity >= 3 ? 0 : 50;
                const total = subtotal + shipping;

                document.getElementById('checkout-subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
                document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`;
                document.getElementById('checkout-total').textContent = `Rs. ${total.toFixed(2)}`;

                // Show checkout modal and overlay
                cartOverlay.classList.add('active');
                checkoutModal.classList.add('active');
            }
        });
    });

    // Final Order Submission (Updated to handle direct buy + payment scanner)
    const checkoutForm = document.getElementById('checkout-form');

    // === Payment Scanner Modal Elements ===
    const paymentOverlay = document.getElementById('payment-overlay');
    const paymentAmountBadge = document.getElementById('payment-amount-badge');
    const paymentConfirmBtn = document.getElementById('payment-confirm-btn');
    const closePaymentBtn = document.getElementById('close-payment-btn');
    const paymentMainState = document.getElementById('payment-main-state');
    const paymentSuccessState = document.getElementById('payment-success-state');
    const paymentDoneBtn = document.getElementById('payment-done-btn');
    const upiIdCopy = document.getElementById('upi-id-copy');
    const copyIconText = document.getElementById('copy-icon-text');

    // Stores the built WhatsApp message and URL for deferred sending
    let pendingWaUrl = '';

    // Helper: build the full WhatsApp message
    const buildOrderMessage = (name, mobile, address, city, state, pincode, itemsToOrder, paymentNote) => {
        const itemsList = itemsToOrder.map((item, index) =>
            `${index + 1}. Product: ${item.name}\n` +
            `   Qty: ${item.quantity}\n` +
            `   Price: ₹${item.price}`
        ).join('\n\n');

        const totalQty = itemsToOrder.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = itemsToOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalQty >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        return `New Order 🛒\n\n` +
            `Customer Details:\n` +
            `Name: ${name}\n` +
            `Mobile: ${mobile}\n` +
            `Address: ${address}, ${city}, ${state} - ${pincode}\n\n` +
            `Order Details:\n` +
            `${itemsList}\n\n` +
            `-----------------------\n` +
            `Subtotal: ₹${subtotal}\n` +
            `Shipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}\n` +
            `Total: ₹${total}\n\n` +
            `${paymentNote}`;
    };

    // Helper: open payment scanner modal
    const openPaymentScanner = (totalAmount, waUrlPaid) => {
        paymentAmountBadge.textContent = `₹${totalAmount}`;
        paymentMainState.style.display = 'block';
        paymentSuccessState.style.display = 'none';
        paymentSuccessState.classList.remove('show');
        paymentOverlay.classList.add('active');

        // Store URL on confirm button
        paymentConfirmBtn.dataset.waUrl = waUrlPaid;
    };

    // Helper: close and reset payment modal
    const closePaymentModal = () => {
        paymentOverlay.classList.remove('active');
        setTimeout(() => {
            paymentMainState.style.display = 'block';
            paymentSuccessState.style.display = 'none';
            paymentSuccessState.classList.remove('show');
            copyIconText.textContent = '⧉ Copy';
        }, 300);
    };

    // UPI ID Copy
    if (upiIdCopy) {
        upiIdCopy.addEventListener('click', () => {
            navigator.clipboard.writeText('apnfoodproducts@upi').then(() => {
                copyIconText.textContent = '✓ Copied!';
                setTimeout(() => { copyIconText.textContent = '⧉ Copy'; }, 2000);
            }).catch(() => {
                copyIconText.textContent = '✓ Copied!';
                setTimeout(() => { copyIconText.textContent = '⧉ Copy'; }, 2000);
            });
        });
    }

    // "I've Paid" → send WhatsApp with payment note, show success
    if (paymentConfirmBtn) {
        paymentConfirmBtn.addEventListener('click', () => {
            const waUrl = paymentConfirmBtn.dataset.waUrl;
            if (waUrl) window.open(waUrl, '_blank');

            // Show success state
            paymentMainState.style.display = 'none';
            paymentSuccessState.style.display = 'flex';
            paymentSuccessState.classList.add('show');
        });
    }

    // Close button
    if (closePaymentBtn) {
        closePaymentBtn.addEventListener('click', closePaymentModal);
    }

    // Done button (after success)
    if (paymentDoneBtn) {
        paymentDoneBtn.addEventListener('click', closePaymentModal);
    }

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('full-name').value;
        const mobile = document.getElementById('mobile-number').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value;

        // Determine which items to include
        const itemsToOrder = directBuyItem ? [directBuyItem] : cart;
        if (itemsToOrder.length === 0) return;

        const totalQty = itemsToOrder.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = itemsToOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalQty >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        // Build WhatsApp message with payment confirmation
        const msgPaid = buildOrderMessage(
            name, mobile, address, city, state, pincode, itemsToOrder,
            `✅ Payment Status: PAID via UPI\n📸 Payment screenshot sent in chat.`
        );

        const waUrlPaid = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msgPaid)}`;

        // Close checkout modal first
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
        checkoutForm.reset();

        // Reset cart state
        if (!directBuyItem) {
            cart = [];
            localStorage.setItem('apnCart', JSON.stringify(cart));
            updateCartBody();
        }
        directBuyItem = null;

        // Show payment scanner after a short delay
        setTimeout(() => {
            openPaymentScanner(total, waUrlPaid);
        }, 350);
    });

    // 6. Navbar hide/show on scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollY = 0;
    let ticking = false;

    function updateNavbarVisibility() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down - hide navbar
                navbar.classList.add('hidden');
            } else {
                // Scrolling up - show navbar
                navbar.classList.remove('hidden');
            }
            navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        } else {
            navbar.classList.remove('hidden');
            navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateNavbarVisibility);
            ticking = true;
        }
    });

    // Mobile Hamburger Menu Logic
    const hamburger = document.getElementById('hamburger');
    const navLinksList = document.querySelector('.nav-links');

    if (hamburger && navLinksList) {
        hamburger.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navItems = navLinksList.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinksList.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }

    // 7. Hero Slider logic
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;

    if (slides.length > 0) {
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            if (index >= slides.length) currentSlide = 0;
            if (index < 0) currentSlide = slides.length - 1;
            slides[currentSlide].classList.add('active');
        }

        nextBtn.addEventListener('click', () => {
            currentSlide++;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', () => {
            currentSlide--;
            showSlide(currentSlide);
        });

        // Auto slide
        setInterval(() => {
            currentSlide++;
            showSlide(currentSlide);
        }, 5000);
    }

    // Initialize cart on page load
    updateCartBadge();

    // 9. Category Filtering Logic (Moved from products.html)
    window.scrollToProducts = (category, event) => {
        // Update selected class on cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => card.classList.remove('selected'));

        if (event) {
            event.currentTarget.classList.add('selected');
        } else {
            // Find card by category text if no event (for initial load)
            const targetCard = Array.from(categoryCards).find(card =>
                card.getAttribute('onclick')?.includes(`'${category}'`)
            );
            if (targetCard) targetCard.classList.add('selected');
        }

        const productCards = document.querySelectorAll('.product-card');
        const sections = {
            'masala': document.getElementById('masala-section'),
            'pickle': document.getElementById('pickle-section'),
            'other': document.getElementById('other-section')
        };

        // Safety check if elements don't exist (e.g. on index.html)
        if (!productCards.length || !sections['masala']) return;

        if (category === 'all') {
            productCards.forEach(card => card.classList.remove('hidden-card'));
            Object.values(sections).forEach(s => {
                if (s) s.style.display = 'block';
            });
            if (sections['masala']) sections['masala'].scrollIntoView({ behavior: 'smooth' });
        } else {
            // Show/Hide sections
            Object.keys(sections).forEach(key => {
                if (sections[key]) {
                    if (key === category) {
                        sections[key].style.display = 'block';
                        setTimeout(() => {
                            sections[key].scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                    } else {
                        sections[key].style.display = 'none';
                    }
                }
            });

            // Filter individual cards
            productCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden-card');
                } else {
                    card.classList.add('hidden-card');
                }
            });
        }

        // Re-trigger reveal animations for visible items
        setTimeout(() => {
            const visibleReveals = document.querySelectorAll('.reveal');
            visibleReveals.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    el.classList.add('active');
                }
            });
        }, 500);
    };

    // Initial check for category hash on page load
    const handleInitialHash = () => {
        const hash = window.location.hash.substring(1);
        if (hash && ['masala', 'pickle', 'other', 'all'].includes(hash)) {
            // Small delay to ensure DOM is ready and layout stabilized
            setTimeout(() => {
                window.scrollToProducts(hash);
            }, 500);
        }
    };

    handleInitialHash();

    // 10. Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // 11. Video Reel Controls (Play/Pause & Animation Toggle)
    const reelSlider = document.querySelector('.video-reel-slider');

    // Ensure video previews are visible (Fix for black thumbnails)
    const initVideoPreviews = () => {
        const videos = document.querySelectorAll('.video-reel-card video');
        videos.forEach(v => {
            v.addEventListener('loadeddata', () => {
                v.currentTime = 0.1;
            });
            // If video is already partially loaded
            if (v.readyState >= 2) {
                v.currentTime = 0.1;
            }
        });
    };
    initVideoPreviews();

    window.togglePlay = (video) => {
        if (!reelSlider) return;

        const allVideos = document.querySelectorAll('.video-reel-card video');

        if (video.paused) {
            // Pause all other videos
            allVideos.forEach(v => {
                v.pause();
                v.classList.remove('playing');
            });

            video.play();
            video.classList.add('playing');
            reelSlider.style.animationPlayState = 'paused';
        } else {
            video.pause();
            video.classList.remove('playing');

            // Check if any other video is still playing (unlikely but safe)
            const anyPlaying = Array.from(allVideos).some(v => !v.paused);
            if (!anyPlaying) {
                reelSlider.style.animationPlayState = 'running';
            }
        }
    };

    if (reelSlider) {
        const pauseAnimation = () => {
            // Only pause if no video is actively playing
            const anyPlaying = Array.from(document.querySelectorAll('.video-reel-card video')).some(v => !v.paused);
            if (!anyPlaying) {
                reelSlider.style.animationPlayState = 'paused';
            }
        };
        const resumeAnimation = () => {
            // Only resume if no video is actively playing
            const anyPlaying = Array.from(document.querySelectorAll('.video-reel-card video')).some(v => !v.paused);
            if (!anyPlaying) {
                reelSlider.style.animationPlayState = 'running';
            }
        };

        reelSlider.addEventListener('touchstart', pauseAnimation, { passive: true });
        reelSlider.addEventListener('touchmove', pauseAnimation, { passive: true });
        reelSlider.addEventListener('touchend', resumeAnimation, { passive: true });
        reelSlider.addEventListener('touchcancel', resumeAnimation, { passive: true });

        // Manual Scroll Buttons
        window.scrollReel = (direction) => {
            // Stop marquee permanently once user clicks buttons
            reelSlider.style.animation = 'none';
            reelSlider.style.width = 'auto';
            reelSlider.style.overflowX = 'auto';

            const scrollAmount = 300; // Approx card width + gap
            reelSlider.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        };
    }

    // 12. Quick View Modal Logic
    const qvModal = document.getElementById('quickview-modal');
    const qvOverlay = document.getElementById('quickview-overlay');
    const closeQvBtn = document.getElementById('close-quickview');

    // Quick View Elements
    const qvImage = document.getElementById('qv-image');
    const qvTitle = document.getElementById('qv-title');
    const qvDescription = document.getElementById('qv-description');
    const qvPrice = document.getElementById('qv-price');
    const qvSpecsList = document.getElementById('qv-specs-list');
    const qvQtyDisplay = document.getElementById('qv-qty-display');
    const qvQtyMinus = document.getElementById('qv-qty-minus');
    const qvQtyPlus = document.getElementById('qv-qty-plus');
    const qvAddToCart = document.getElementById('qv-add-to-cart');
    const qvBuyNow = document.getElementById('qv-buy-now');

    let currentQvQty = 1;

    // Mock Specifications Database
    const generateSpecs = (productName) => {
        const specs = [];
        specs.push({ label: 'Brand', value: 'APN Food Products' });

        if (productName.toLowerCase().includes('masala')) {
            specs.push({ label: 'Specialty', value: '20 min Ready' });
            specs.push({ label: 'Shelf Life', value: '12 Months' });
        } else if (productName.toLowerCase().includes('pickle')) {
            specs.push({ label: 'Specialty', value: 'Authentic Homemade' });
            specs.push({ label: 'Shelf Life', value: '6 Months' });
        } else {
            specs.push({ label: 'Specialty', value: 'Premium Quality' });
        }

        // Try to extract weight from name (e.g. "Masala (200g)" or "Masala - 200g")
        const weightMatch = productName.match(/(\d+g|\d+kg)/i);
        if (weightMatch) {
            specs.push({ label: 'Weight', value: weightMatch[1] });
        } else {
            specs.push({ label: 'Weight', value: 'Standard' });
        }

        return specs;
    };

    // Product Descriptions Database
    const getProductDescription = (productName) => {
        const lowerName = productName.toLowerCase();
        if (lowerName.includes('hyderabadi')) {
            return "Bring home the authentic taste of Hyderabad with our Hyderabadi Biriyani Masala. This gravy-style blend creates a rich, flavorful base that gives your biriyani its signature royal taste. Now enjoy traditional Hyderabadi biriyani in just 20 minutes with ease.";
        }
        if (lowerName.includes('mandhi masala') || lowerName.includes('mandi masala')) {
            return "Enjoy the authentic taste of Arabian Mandi with our specially crafted gravy-style Mandi Masala, designed to create a rich, aromatic base that perfectly blends with rice and meat. This masala delivers the signature mild spice, deep flavor, and irresistible aroma of Arabian cuisine — now made simple and quick, ready in just 20 minutes.";
        }
        if (lowerName.includes('biriyani masala') || lowerName.includes('biryani masala')) {
            return "Enjoy delicious, aromatic biriyani with our APN Biriyani Masala, specially crafted as a gravy-style blend that perfectly coats rice and meat for a juicy, flavorful experience. Designed for convenience, this masala helps you prepare tasty biriyani in just 20 minutes, without compromising on traditional flavor.";
        }
        if (lowerName.includes('madhooth')) {
            return "Bring home the unique taste of Arabian Madhooth with our specially crafted Madhooth Gravy type Masala. Designed for quick and easy cooking, this spice blend lets you prepare a rich, flavorful dish in just 20 minutes using only a few simple ingredients. Madhooth Masala combines carefully selected spices to create a deep, savory taste with a hint of warmth and aroma that sets it apart from regular dishes. Whether paired with chicken, rice, or enjoyed as a standalone preparation, it delivers a satisfying and homely flavor every time.";
        }
        if (lowerName.includes('majboos')) {
            return "Experience the rich and aromatic taste of Arabian Majboos with our specially crafted Majboos Gravy type Masala. Inspired by classic Arabian cuisine, this blend of premium spices brings you a perfectly balanced dish with deep flavor, mild heat, and irresistible aroma. With Majboos Masala, preparing a delicious chicken and rice meal is quick and effortless. Just add it to your rice and chicken, cook together, and enjoy a wholesome dish that captures the essence of authentic Majboos in just 20 minutes.";
        }
        if (lowerName.includes('multipurpose') || lowerName.includes('multi purpose')) {
            return "Simplify your cooking with our Multi Purpose Masala, a versatile gravy-style spice blend designed for preparing chicken, mutton, fish, and more — all with a single masala. Carefully crafted with a balanced mix of spices, this masala creates a rich, flavorful gravy base that enhances every dish, making your cooking easier and consistently delicious.";
        }
        if (lowerName.includes('lemon pickle')) {
            return "Enjoy the tangy and spicy taste of APN NAS Magic Lemon Pickle, made with fresh lemons and premium spices. Prepared in traditional Kerala style, it delivers rich flavor and homemade taste in every bite. Perfect as a side dish with rice, biriyani, chapati, and dosa.";
        }
        if (lowerName.includes('beef pickle')) {
            return "Experience the rich and spicy flavor of APN NAS Magic Beef Pickle, made with tender beef pieces and a blend of premium spices. Prepared in authentic Kerala style, it delivers bold taste and a true homemade feel. Perfect as a side dish with rice, biriyani, chapati, and more.";
        }
        if (lowerName.includes('chilli pickle')) {
            return "Enjoy the perfect blend of heat and flavor with APN NAS Magic Green Chilli Pickle. Made with fresh green chillies and premium spices, this pickle delivers a unique sweet and spicy taste with a traditional Kerala touch. A great side dish to enhance everyday meals like rice, chapati, and dosa.";
        }
        if (lowerName.includes('fish pickle')) {
            return "Enjoy the rich and traditional flavor of APN NAS Magic Fish Pickle, made with carefully selected fish pieces and premium spices. Prepared in authentic Kerala style, it offers a perfect balance of spicy, tangy, and aromatic taste in every bite. A delicious side dish that pairs perfectly with rice, kanji, chapati, and more.";
        }
        if (lowerName.includes('garlic pickle')) {
            return "Enjoy the bold and rich flavor of APN NAS Magic Garlic Pickle, made with fresh garlic cloves and a blend of premium spices. Prepared in authentic Kerala style, it delivers a perfect mix of spicy and tangy taste with a homemade touch. A great side dish for rice, kanji, chapati, and more.";
        }
        if (lowerName.includes('mango pickle')) {
            return "Enjoy the tangy and spicy taste of APN NAS Magic Cut Mango Pickle, made with fresh raw mango pieces and premium spices. Prepared in authentic Kerala style, it delivers a bold flavor and traditional homemade taste in every bite. Perfect as a side dish with rice, kanji, chapati, and more.";
        }
        if (lowerName.includes('lemon & dates') || lowerName.includes('lemon and dates')) {
            return "Enjoy a unique blend of flavors with APN NAS Magic Lemon & Dates Pickle. Made with fresh lemons, sweet dates, and premium spices, it delivers a perfect balance of sweet, tangy, and mildly spicy taste in every bite. A delicious side dish that pairs well with rice, chapati, and traditional meals.";
        }
        if (lowerName.includes('fried onion')) {
            return "Add rich flavor and crunch to your dishes with APN NAS Magic Fried Onion. Made from carefully selected onions and perfectly fried to a golden crisp, it enhances the taste and aroma of your meals instantly. Perfect for biriyani, mandi, gravies, and everyday cooking.";
        }
        if (lowerName.includes('asafoetida')) {
            return "Enhance the flavor of your dishes with APN NAS Magic Compound Asafoetida Powder. Made from quality ingredients, it adds a strong aroma and authentic taste to curries, dals, and traditional recipes. Just a small pinch is enough to bring out a rich and delicious flavor.";
        }
        return ""; // Fallback for other products
    };

    if (qvModal) {
        const openQuickView = (card) => {
            const titleEl = card.querySelector('h3');
            const priceEl = card.querySelector('.price');
            const imgEl = card.querySelector('img');
            const addToCartBtn = card.querySelector('.add-to-cart-btn');

            if (!titleEl || !priceEl || !imgEl || !addToCartBtn) return;

            const title = titleEl.textContent;
            const priceText = priceEl.textContent;
            const imgSrc = imgEl.getAttribute('src');

            // From Add to cart button data attributes
            const productName = addToCartBtn.getAttribute('data-product');
            const priceValue = addToCartBtn.getAttribute('data-price');

            // Populate Modal
            qvImage.src = imgSrc;
            qvImage.alt = title;
            qvTitle.textContent = title;
            if (qvDescription) {
                qvDescription.textContent = getProductDescription(title);
                qvDescription.style.display = qvDescription.textContent ? 'block' : 'none';
            }
            qvPrice.textContent = priceText;

            // Generate Specs
            const specs = generateSpecs(title);
            qvSpecsList.innerHTML = specs.map(spec => `
                <li>
                    <span class="spec-label">${spec.label}</span>
                    <span class="spec-value">${spec.value}</span>
                </li>
            `).join('');

            // Reset Qty
            currentQvQty = 1;
            qvQtyDisplay.textContent = currentQvQty;

            // Setup buttons
            qvAddToCart.setAttribute('data-product', productName);
            qvAddToCart.setAttribute('data-price', priceValue);
            qvBuyNow.setAttribute('data-product', productName);
            qvBuyNow.setAttribute('data-price', priceValue);

            // Show modal
            qvModal.classList.add('active');
            qvOverlay.classList.add('active');
        };

        const closeQuickView = () => {
            qvModal.classList.remove('active');
            qvOverlay.classList.remove('active');
        };

        closeQvBtn.addEventListener('click', closeQuickView);
        qvOverlay.addEventListener('click', closeQuickView);

        // Attach listeners to product images
        const productImages = document.querySelectorAll('.product-image-container');
        productImages.forEach(container => {
            container.style.cursor = 'pointer'; // Make it look clickable
            container.addEventListener('click', () => {
                const card = container.closest('.product-card');
                if (card) openQuickView(card);
            });
        });

        // Attach listeners to product titles
        const productTitles = document.querySelectorAll('.product-info h3');
        productTitles.forEach(title => {
            title.style.cursor = 'pointer'; // Make it look clickable
            title.addEventListener('click', () => {
                const card = title.closest('.product-card');
                if (card) openQuickView(card);
            });
        });

        // Quick View Qty Controls
        qvQtyMinus.addEventListener('click', () => {
            if (currentQvQty > 1) {
                currentQvQty--;
                qvQtyDisplay.textContent = currentQvQty;
            }
        });

        qvQtyPlus.addEventListener('click', () => {
            currentQvQty++;
            qvQtyDisplay.textContent = currentQvQty;
        });

        // Quick View Add to Cart
        qvAddToCart.addEventListener('click', () => {
            const productName = qvAddToCart.getAttribute('data-product');
            const price = parseInt(qvAddToCart.getAttribute('data-price'));
            const imgSrc = qvImage.src;

            const existingItem = cart.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += currentQvQty;
                if (!existingItem.image && imgSrc) existingItem.image = imgSrc;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: currentQvQty,
                    image: imgSrc
                });
            }

            localStorage.setItem('apnCart', JSON.stringify(cart));
            updateCartBody();

            // Feedback
            const originalText = qvAddToCart.textContent;
            qvAddToCart.textContent = 'Added!';
            setTimeout(() => {
                qvAddToCart.textContent = originalText;
                closeQuickView();
            }, 1000);
        });

        // Quick View Buy Now
        qvBuyNow.addEventListener('click', () => {
            const productName = qvBuyNow.getAttribute('data-product');
            const price = parseInt(qvBuyNow.getAttribute('data-price'));

            directBuyItem = {
                name: productName,
                price: price,
                quantity: currentQvQty
            };

            closeQuickView();

            // Populate Checkout Summary for Direct Buy
            const subtotal = price * currentQvQty;
            const shipping = currentQvQty >= 3 ? 0 : 50;
            const total = subtotal + shipping;

            document.getElementById('checkout-subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
            document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `Rs. ${shipping.toFixed(2)}`;
            document.getElementById('checkout-total').textContent = `Rs. ${total.toFixed(2)}`;

            checkoutModal.classList.add('active');
            cartOverlay.classList.add('active'); // Use cartOverlay for checkout modal as per existing logic
        });
    }
});
