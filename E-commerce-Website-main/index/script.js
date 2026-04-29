const bar = document.getElementById('bar');
const nav = document.getElementById('navbar');
const close = document.getElementById('close');


if(bar){
    bar.addEventListener('click', () =>{
        nav.classList.add('active');
    })

}
if(close){
    close.addEventListener('click', () =>{
        nav.classList.remove('active');
    })

}

function getProductImage(product) {
    const name = product.name.toLowerCase();
    const group = product.group;

    // More specific checks first based on product name
    if (name.includes('macbook')) {
        return 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600';
    }
    if (name.includes('dell')) {
        return 'https://images.pexels.com/photos/6446709/pexels-photo-6446709.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
    if (name.includes('lenovo') || name.includes('thinkpad')) {
        return 'https://images.pexels.com/photos/4100657/pexels-photo-4100657.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
    if (name.includes('iphone')) {
        return 'https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
    if ((name.includes('samsung') || name.includes('galaxy')) && group === 'Mobile') {
        return 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
    if (name.includes('ipad')) {
        return 'https://images.pexels.com/photos/1334598/pexels-photo-1334598.jpeg?auto=compress&cs=tinysrgb&w=600';
    }
    if (name.includes('airpods')) {
        return 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600';
    }

    // Fallback to generic category images
    switch (product.group) {
        case 'Laptop':
            return 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=600';
        case 'Tablet':
            return 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600';
        case 'Mobile':
            return 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=600';
        case 'Accessory':
            return 'https://images.pexels.com/photos/3945659/pexels-photo-3945659.jpeg?auto=compress&cs=tinysrgb&w=600';
        default:
            return 'https://via.placeholder.com/300x300.png?text=Gadget';
    }
}

function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Calculate total number of individual items, not quantities of unique items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    });
}

function animateCartIcon() {
    const cartIcons = document.querySelectorAll('.fa-shopping-bag');
    cartIcons.forEach(icon => {
        icon.classList.add('cart-shake');
        setTimeout(() => {
            icon.classList.remove('cart-shake');
        }, 700); // Must match animation duration
    });
}

let allProducts = []; // Declare allProducts globally

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
}

function updateItemQuantity(productId, change) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
}

document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.querySelector('#product1 .pro-container');
    const filterContainer = document.getElementById('filter-container');
    let allProducts = [];
    let currentlyDisplayedProducts = []; // To keep track of what's on screen

    const displayProducts = (productsToDisplay) => {
        currentlyDisplayedProducts = productsToDisplay; // Update the current list
        productContainer.innerHTML = ''; // Clear existing products
        if (productsToDisplay.length === 0) {
            productContainer.innerHTML = '<p>No products found in this category.</p>';
            return;
        }

        const cart = getCart(); // Get current cart state

        productsToDisplay.forEach(product => {
            const isSoldOut = product.status === 'Unavailable';
            // Use the specific image if available, otherwise fall back to a category-based image.
            const imageUrl = product.image_url || getProductImage(product);
            const itemInCart = cart.find(item => item.id === product.id);

            let cartControlsHtml;
            if (itemInCart) {
                // If item is in cart, show quantity controls
                cartControlsHtml = `
                    <div class="quantity-controls">
                        <button class="quantity-btn quantity-minus" data-id="${product.id}">-</button>
                        <span class="product-quantity-display">${itemInCart.quantity}</span>
                        <button class="quantity-btn quantity-plus" data-id="${product.id}">+</button>
                    </div>
                `;
            } else {
                // Otherwise, show the add to cart button
                cartControlsHtml = `<a href="#" class="cart-btn"><i class="fal fa-shopping-cart cart"></i></a>`;
            }

            const productHtml = `
                <div class="pro ${isSoldOut ? 'sold-out' : ''}" data-id="${product.id}">
                    <img src="${imageUrl}" alt="${product.name}">
                    <div class="des">
                        <span>${product.group}</span>
                        <h5>${product.name}</h5>
                        <h4>$${product.price} <del>$${product.msrp}</del></h4>
                    </div>
                    ${cartControlsHtml}
                    ${isSoldOut ? '<div class="sold-out-overlay"><span>Sold Out</span></div>' : ''}
                </div>
            `;
            productContainer.innerHTML += productHtml;
        });
    };

    // Initial fetch and display for both home and shop pages
    // This block will run if productContainer exists (on index.html and shop.html)
    if (productContainer) {
        fetch('https://s3.us-east-1.amazonaws.com/assets.spotandtango/products.json')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json(); // Parse JSON
            })
            .then(products => {
                allProducts = products;
                displayProducts(allProducts); // Display all products initially
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>Sorry, we couldn\'t load the products at this time.</p>';
            });
    }

    if (productContainer) {
        productContainer.addEventListener('click', (e) => {
            const proDiv = e.target.closest('.pro');
            if (!proDiv || proDiv.classList.contains('sold-out')) return;

            const productId = proDiv.dataset.id;
            const product = allProducts.find(p => p.id === productId);
            if (!product) return;

            let cartModified = false;

            if (e.target.closest('.cart-btn')) {
                e.preventDefault();
                let cart = getCart();
                // This button only appears if the item is not in the cart
                cart.push({ id: product.id, name: product.name, price: product.price, image: product.image_url || getProductImage(product), quantity: 1 });
                saveCart(cart);
                alert(`${product.name} has been added to your cart.`);
                cartModified = true;
            }
            else if (e.target.closest('.quantity-plus')) {
                e.preventDefault();
                updateItemQuantity(productId, 1);
                cartModified = true;
            }
            else if (e.target.closest('.quantity-minus')) {
                e.preventDefault();
                updateItemQuantity(productId, -1);
                cartModified = true;
            } else {
                // Navigate to product page
                window.location.href = `sproduct.html?id=${productId}`;
            }

            if (cartModified) {
                animateCartIcon();
                // Re-render the currently displayed products to update the UI
                displayProducts(currentlyDisplayedProducts);
            }
        });
    }

    // Filter container logic
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
                filterContainer.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');

                const category = e.target.dataset.category;
                const filteredProducts = category === 'all' ? allProducts : allProducts.filter(p => p.group === category);
                displayProducts(filteredProducts);
            }
        });
    }

    updateCartIcon(); // Initial call for all pages

    const newsletterSection = document.querySelector('#newsletter');
    if (newsletterSection) {
        const newsletterInput = newsletterSection.querySelector('input');
        const newsletterButton = newsletterSection.querySelector('button');

        newsletterButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default form action
            const email = newsletterInput.value.trim();

            // Basic email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email && emailRegex.test(email)) {
                newsletterInput.value = ''; // Clear the input field
                alert('Thank you for subscribing to our newsletter!');
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});