let itemInventory;

$(document).ready(function () {

  // load shop items from local json file
  const INVENTORY_DIR = "json/inventory.json";
  if (Modernizr.fetch) {
    loadJsonByFetch(INVENTORY_DIR, loadStore);
  } else {
    loadJsonByXhr(INVENTORY_DIR, loadStore);
  }

  // initiate clear cart button
  document.querySelector("#clear-cart-button").addEventListener("click", clearShoppingCart);
  updateShoppingCartWindow();

});



function loadStore(productsJson) {

  sessionStorage.setItem("inventory", JSON.stringify(productsJson));

  const productPanel = document.querySelector(".product-panel .panel-body");

  // generate item HTML and append it to store panel
  let htmlPayload = ``;
  productsJson.forEach(item => {
    htmlPayload += `
    <div data-item-id="${item.id}" class="product-card">
        <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
        <h4 id="product-name">${item.title}</h4>
        <p>${item.description}</p>
        <hr />
        <p class="product-price"><span class='product-price-value'>${item.price.value}</span> ${item.price.currency}</p>
        <div>
        <button data-item-id="${item.id}" type="button" class="btn btn-success">Add to cart</button>
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="1" />
        </div>
    </div>`;
  });
  productPanel.innerHTML = htmlPayload.length > 0 ? htmlPayload : "Failed to load store items.";

  // add event listeners to "Add to cart" all buttons
  const addToCartButtons = document.querySelectorAll(".product-panel .panel-body button[data-item-id]");
  for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener('click', clickAddToCartButton);
  }
}

function clickAddToCartButton(event) {
  const thisButton = event.currentTarget;
  const itemID = thisButton.dataset.itemId;
  const itemCount = Number(document.querySelector(`input[data-item-id="${itemID}"]`).value);

  addItemToShoppingCart(itemID, itemCount);

  const productCard = document.querySelector(`.product-card[data-item-id="${itemID}"]`);

  productCard.classList.add("in-basket");
  // console.log("Added product " + itemID + " to cart");
}

function getLocallyStoredShoppingCart() {
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  return !shoppingCart || Object.keys(shoppingCart).length === 0 ? {} : shoppingCart;
}

function addItemToShoppingCart(itemID, itemCount) {
  const shoppingCart = getLocallyStoredShoppingCart();
  shoppingCart[itemID] = Number(shoppingCart[itemID] + itemCount) || itemCount;
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  updateShoppingCartWindow(shoppingCart);
}

function clearShoppingCart() {
  localStorage.setItem("shoppingCart", JSON.stringify({}));
  updateShoppingCartWindow({});
}

function updateShoppingCartWindow() {

  const shoppingCartPanel = document.querySelector(".cart-item-list");
  const subtotalLabel = document.querySelector('#subtotal-value');
  subtotalLabel.textContent = '';

  const inventory = JSON.parse(sessionStorage.getItem("inventory"));
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));

  let subTotal = 0;
  let htmlPayload = ``;
  Object.keys(shoppingCart).forEach(itemID => {

    const item = inventory.find(item => item.id === Number(itemID));

    const itemCount = shoppingCart[itemID];
    const itemTotal = item.price.value * itemCount;
    subTotal += itemTotal;

    htmlPayload += `
    <div class="cart-item">
      <h4>${item.title}</h4>
      <div class="cart-item-summary">
        <span id="item-1-price">${item.price.value} kr</span> x
        <input type="number" min="1" max="1000" class="cart-item-qty" value="${itemCount}" /> =
        <span id="item-1-stack-price">${itemTotal} kr</span>
      </div>
      <button class="remove-cart-item">x</button>
    </div>`;

  });

  subtotalLabel.textContent = subTotal;

  if (htmlPayload.length === 0) {
    document.querySelector(".cart-empty-message").style.display = "block";
    shoppingCartPanel.innerHTML = "";
  } else {
    document.querySelector(".cart-empty-message").style.display = "none";
    shoppingCartPanel.innerHTML = htmlPayload;
  }
}