const MAX_CART_ITEMS = 3;
const items = document.querySelectorAll('.shelf .product');
const cart = document.querySelector('.cart .cart-bg');
const cartItemsContainer = document.querySelector('.cart-items');
const checkoutButton = document.querySelector('.checkout');
let cartItemsCount = 0;
let currentTouchItem = null;
let isTouchingCart = false;

// Инициализация событий
initDragAndDrop();
initTouchEvents();
initCartEvents();

// Инициализация функций
function initDragAndDrop() {
    items.forEach(item => {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
    });
    cart.addEventListener('dragover', (e) => e.preventDefault());
    cart.addEventListener('drop', handleDrop);
}

function initTouchEvents() {
    items.forEach(item => {
        item.addEventListener('touchstart', handleTouchStart, { passive: true });
        item.addEventListener('touchmove', handleTouchMove, { passive: true });
        item.addEventListener('touchend', handleTouchEnd);
    });
}

function initCartEvents() {
    cartItemsContainer.addEventListener('click', () => {
        checkCart();
    });
}

// Обработчики событий
function handleDragStart(e) {
    if (cartItemsCount >= MAX_CART_ITEMS) return;

    const parentLi = e.target.closest('li');
    const img = parentLi.querySelector('img');
    
    e.dataTransfer.setData('text/plain', img.src);
    e.dataTransfer.setData('text/id', parentLi.id);
    parentLi.style.opacity = '0.5';
}

function handleDrop(e) {
    e.preventDefault();
    if (cartItemsCount >= MAX_CART_ITEMS) return;

    const itemSrc = e.dataTransfer.getData('text/plain');
    const itemId = e.dataTransfer.getData('text/id');
    addProductToCart(itemSrc, itemId);
}

function handleTouchStart(e) {
    if (cartItemsCount >= MAX_CART_ITEMS) return;

    currentTouchItem = e.target.closest('li');
    currentTouchItem.style.opacity = '0.5';
}

function handleTouchMove(e) {
    if (!currentTouchItem) return;
    const touch = e.touches[0];
    const cartRect = cart.getBoundingClientRect();
    isTouchingCart = (
        touch.clientX >= cartRect.left &&
        touch.clientX <= cartRect.right &&
        touch.clientY >= cartRect.top &&
        touch.clientY <= cartRect.bottom
    );
}

function handleTouchEnd(e) {
    if (currentTouchItem && isTouchingCart) {
        const img = currentTouchItem.querySelector('img');
        const itemSrc = img.src;
        const itemId = currentTouchItem.id;
        addProductToCart(itemSrc, itemId);
    }
    resetCurrentTouchItem();
}

// Логика корзины
function addProductToCart(src, id) {
    if (cartItemsCount >= MAX_CART_ITEMS) return;

    const originalItem = document.getElementById(id);
    const flyingItem = createFlyingItem(originalItem);

    document.body.appendChild(flyingItem);

    flyingItem.addEventListener('animationend', () => {
        document.body.removeChild(flyingItem);
        addItemToCart(src, id);
        checkCart();
    });
}

function checkCart() {
    if (cartItemsCount >= MAX_CART_ITEMS) {
        checkoutButton.classList.remove('hidden');
        checkoutButton.classList.add('visible');
        lockShelfItems();
    } else {
        checkoutButton.classList.add('hidden');
        checkoutButton.classList.remove('visible');
        unlockShelfItems();
    }
}

// Вспомогательные функции
function lockShelfItems() {
    items.forEach(item => item.classList.add('locked'));
}

function unlockShelfItems() {
    items.forEach(item => item.classList.remove('locked'));
}

function addItemToCart(src, id) {
    const newListItem = document.createElement('li');

    newListItem.dataset.id = id;

    const newItemImage = document.createElement('img');
    newItemImage.src = src;

    newListItem.appendChild(newItemImage);
    cartItemsContainer.appendChild(newListItem);
    cartItemsCount++;

    const originalItem = document.getElementById(id);
    if (originalItem) {
        originalItem.style.display = 'none';
    }
}


function createFlyingItem(originalItem) {
    const flyingItem = originalItem.cloneNode(true);
    const itemRect = originalItem.getBoundingClientRect();
    flyingItem.style.position = 'fixed';
    flyingItem.style.left = `${itemRect.left}px`;
    flyingItem.style.top = `${itemRect.top}px`;
    flyingItem.style.width = `${itemRect.width}px`;
    flyingItem.style.height = `${itemRect.height}px`;
    flyingItem.classList.add('flying');
    return flyingItem;
}

function resetCurrentTouchItem() {
    if (currentTouchItem) {
        currentTouchItem.style.opacity = '';
        currentTouchItem = null;
        isTouchingCart = false;
    }
}
