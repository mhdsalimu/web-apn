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

            // Check if product already in cart
            const existingItem = cart.find(item => item.name === productName);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: quantity
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

    // Final Order Submission (Updated to handle direct buy)
    const checkoutForm = document.getElementById('checkout-form');
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

        const itemsList = itemsToOrder.map((item, index) => 
            `${index + 1}. Product: ${item.name}\n` +
            `   Qty: ${item.quantity}\n` +
            `   Price: ₹${item.price}`
        ).join('\n\n');

        const totalQty = itemsToOrder.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = itemsToOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = totalQty >= 3 ? 0 : 50;
        const total = subtotal + shipping;

        const message = `New Order 🛒\n\n` +
            `Customer Details:\n` +
            `Name: ${name}\n` +
            `Mobile: ${mobile}\n` +
            `Address: ${address}, ${city}, ${state} - ${pincode}\n\n` +
            `Order Details:\n` +
            `${itemsList}\n\n` +
            `-----------------------\n` +
            `Subtotal: ₹${subtotal}\n` +
            `Shipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}\n` +
            `Total: ₹${total}`;

        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');

        // Reset state
        if (!directBuyItem) {
            cart = [];
            localStorage.setItem('apnCart', JSON.stringify(cart));
            updateCartBody();
        }
        
        directBuyItem = null;
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
        checkoutForm.reset();
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
});
