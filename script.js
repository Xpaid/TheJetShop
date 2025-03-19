
function fetchProducts() {
  return fetch("products.json")
    .then((response) => response.json())
    .then((products) => {
      updateCarousel(products);
      updateProductGrid(products);
      updateCartModal();
    });
}

function loadProductDetails() {
  const selectedProductIndex = localStorage.getItem("selectedProductIndex");
  if (selectedProductIndex === null) return;

  fetch("products.json")
    .then((response) => response.json())
    .then((products) => {
      const selectedProduct = products[selectedProductIndex];

      // Set the selected product global
      window.selectedProduct = selectedProduct;

      // Update product details
      document.getElementById("productImage").src = selectedProduct.image;
      document.getElementById("productName").textContent = selectedProduct.name;
      document.getElementById("productDescription").textContent = selectedProduct.description;
      document.getElementById("productPrice").textContent = `$${selectedProduct.price}`;

      // Pass to updateProductCarousel function
      const productImages = [selectedProduct.image, ...(selectedProduct.additionalImages || [])];
      updateProductCarousel(productImages);
    });
}


function updateProductCarousel(productImages) {
  const productCarouselContainer = document.getElementById("carouselImages");
  productCarouselContainer.innerHTML = "";  //clear

  productImages.forEach((image, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-item ${index === 0 ? "active" : ""}`;
    slide.innerHTML = `<img src="${image}" class="d-block w-100" alt="Slide ${index + 1}">`;
    productCarouselContainer.appendChild(slide);
  });

  if (productImages.length > 1) {
    new bootstrap.Carousel(document.getElementById("productCarousel"), { ride: "carousel" });
  }
}

function updateCarousel(products) {
  const heroCarouselContainer = document.getElementById("carouselContent");
  heroCarouselContainer.innerHTML = "";

  products.forEach((product, index) => {
    const slide = createCarouselSlide(product, index);
    heroCarouselContainer.appendChild(slide);
  });

  initializeCarousel();
}

function createCarouselSlide(product, index) {
  const slide = document.createElement("div");
  slide.className = `carousel-item ${index === 0 ? "active" : ""}`;
  slide.innerHTML = `<img src="${product.image}" class="d-block w-100" alt="${product.name}">`;
  return slide;
}

function initializeCarousel() {
  document.addEventListener("DOMContentLoaded", function () {
    let myCarousel = new bootstrap.Carousel(document.getElementById("heroCarousel"), {
      interval: 2000,
      ride: "carousel",
      pause: false, 
      wrap: true,
    });
  });

  document.getElementById("heroCarousel").setAttribute("data-bs-interval", "3000");
}

function updateProductGrid(products) {
  const productGridContainer = document.getElementById("productGrid");
  productGridContainer.innerHTML = "";

  products.forEach((product, index) => {
    const productCard = createProductCard(product, index);
    productGridContainer.appendChild(productCard);
  });
}

function createProductCard(product, index) {
  const productCard = document.createElement("div");
  productCard.className = "col-md-4 mb-4";
  productCard.innerHTML = `
    <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.description}</p>
            <p class="text-primary fw-bold">${product.price}</p>
            <button class="btn btn-dark" onclick="redirectToProduct(${index})">View Details</button>
            <button class="btn text-bg-warning" onclick="addToCart(${index})">Add to Cart</button>
        </div>
    </div>
  `;
  return productCard;
}

// Redirect to product details page
function redirectToProduct(index) {
  localStorage.setItem("selectedProductIndex", index);
  window.location.href = "product.html";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCounter() {
  const cartCounter = document.getElementById("cartCounter");
  if (cartCounter) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalCount;
    cartCounter.classList.toggle("d-none", totalCount === 0);
  }
}

function updateCartModal() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartCounter = document.getElementById("cartCounter");
  
  // Clear
  if (cartItemsContainer) {
    cartItemsContainer.innerHTML = "";
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<li class='list-group-item'>Your cart is empty</li>";
    } else {
      cart.forEach((item, index) => {
        const listItem = createCartItem(item, index);
        cartItemsContainer.appendChild(listItem);
      });
    }
  }

  if (cartCounter) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalCount;
    cartCounter.classList.toggle("d-none", totalCount === 0); // Hide counter if empty
  }

  // Store updated cart localStorage
  localStorage.setItem("cart", JSON.stringify(cart));  
}

function createCartItem(item, index) {
  const listItem = document.createElement("li");
  listItem.className = "list-group-item d-flex justify-content-between align-items-center";
  listItem.innerHTML = `
    ${item.name} - <strong>${item.price}</strong>
    <div>
        <button class="btn btn-sm btn-dark" onclick="changeQuantity(${index}, -1)">-</button>
        <span class="mx-2">${item.quantity}</span>
        <button class="btn btn-sm btn-dark" onclick="changeQuantity(${index}, 1)">+</button>
    </div>
  `;
  return listItem;
}

function changeQuantity(index, change) {
  if (cart[index].quantity + change > 0) {
    cart[index].quantity += change;
  } else {
    cart.splice(index, 1);
  }
  updateCartModal();
}

function addToCart_product(product) {
  let cartItem = cart.find((item) => item.name === product.name);
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }
  updateCartModal();
  showNotif(); 
}

function addToCart(index) {
  fetch("products.json")
    .then((response) => response.json())
    .then((products) => {
      let product = products[index];
      let cartItem = cart.find((item) => item.name === product.name);
      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cart.push({
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }
      updateCartModal();
      showNotif();
    });
}

function showNotif() {
  let toastEl = document.getElementById("cartToast");
  if (toastEl) {
    let toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

function initCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || []; // Always load localStorage
  updateCartCounter();
  updateCartModal();
}

function initEventListeners() {
  document.addEventListener("DOMContentLoaded", function () {
    initCart(); 
    updateCartCounter();  

    const productsNav = document.getElementById("productsNav");
    if (productsNav) {
      productsNav.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("productSection").scrollIntoView({ behavior: "smooth" });
        updateCartModal();
      });
    }
  });
}

function init() {
  fetchProducts();
  initEventListeners();
  loadProductDetails();
  updateCartModal();
}

document.addEventListener("DOMContentLoaded", init);
