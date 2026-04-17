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

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

    // Checkout Handler
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        const itemsList = cart.map(item => `${item.quantity}x ${item.name} (₹${item.price})`).join('\n');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const message = `Hi, I want to order:\n\n${itemsList}\n\nTotal: ₹${total}\n\nPlease confirm availability and details.`;
        
        const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
        
        // Clear cart after checkout
        cart = [];
        localStorage.setItem('apnCart', JSON.stringify(cart));
        updateCartBody();
        closeCart();
    });

    // Remaining Cart Logic for Direct Buy
    const formatWhatsAppMsg = (productName, quantity = 1) => {
        const text = `Hi, I want to order:\n${quantity}x ${productName}\n\nPlease confirm availability and details.`;
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

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-product');
            const price = e.target.getAttribute('data-price');
            
            // Get quantity from the nearest quantity selector
            const quantityDisplay = e.target.closest('.product-info').querySelector('.qty-display');
            const quantity = parseInt(quantityDisplay.textContent);

            if (productName) {
                // Generate WhatsApp wa.me link with quantity
                const waUrl = `https://wa.me/${phoneNumber}?text=${formatWhatsAppMsg(productName, quantity)}`;

                // Redirect to WhatsApp
                window.open(waUrl, '_blank');
            }
        });
    });

    // 5. Setup General Sticky WhatsApp Button URL
    const stickyWaBtn = document.getElementById('wa-sticky');
    if (stickyWaBtn) {
        const generalMsg = encodeURIComponent("Hi APN Food Products! I'd like to know more about your products.");
        stickyWaBtn.setAttribute('href', `https://wa.me/${phoneNumber}?text=${generalMsg}`);
        stickyWaBtn.setAttribute('target', '_blank');
    }

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
});
