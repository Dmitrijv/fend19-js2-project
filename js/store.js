$(document).ready(function() {
  // load shop items from local json file
  const INVENTORY_DIR = "json/inventory.json";
  if (Modernizr.fetch) {
    loadJsonByFetch(INVENTORY_DIR, loadStore);
  } else {
    loadJsonByXhr(INVENTORY_DIR, loadStore);
  }
});

function loadStore(productsJson) {
  sessionStorage.setItem("inventory", JSON.stringify(productsJson));

  const productPanel = document.querySelector(".product-panel .panel-body");
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));

  // generate item HTML and append it to store panel
  let htmlPayload = ``;
  productsJson.forEach(item => {
    const inBasketFlag = shoppingCart[item.id] ? "in-basket" : "";
    htmlPayload += `
    <div data-item-id="${item.id}" class="product-card ${inBasketFlag}">
      <div class="product-description-wrapper">
          <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
          <h4 id="product-name">${item.title}</h4>
          <p class="product-description">${item.description}</p>
      </div>
      <div class="product-interaction-wrapper">
        <hr />
        <p class="product-price"><span class='product-price-value'>${item.price.value}</span> ${item.price.currency}</p>
        <button data-item-id="${item.id}" type="button" class="btn btn-success">Add to cart</button>
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="1" />
      </div>
    </div>`;
  });
  productPanel.innerHTML = htmlPayload.length > 0 ? htmlPayload : "Failed to load store items.";

  assignButtonEvents();
  updateShoppingCartWindow();
}

function assignButtonEvents() {
  // add event listeners to all "Add to cart" buttons
  const addToCartButtons = document.querySelectorAll(".product-panel .panel-body button[data-item-id]");
  for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", clickAddToCartButton);
  }
  // set up clear cart button
  document.querySelector("#clear-cart-button").addEventListener("click", clearShoppingCart);
  // set up clear to order button
  document.querySelector("#to-order-button").addEventListener("click", onToOrderClick);
}

function clickAddToCartButton(event) {
  const button = event.currentTarget;

  const itemID = button.dataset.itemId;
  const itemCount = Number(document.querySelector(`input[data-item-id="${itemID}"]`).value);
  addItemToShoppingCart(itemID, itemCount);

  const productCard = document.querySelector(`.product-card[data-item-id="${itemID}"]`);
  productCard.classList.add("in-basket");
}

function getShoppingCart() {
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  return !shoppingCart || Object.keys(shoppingCart).length === 0 ? {} : shoppingCart;
}

function addItemToShoppingCart(itemID, itemCount) {
  const shoppingCart = getShoppingCart();
  shoppingCart[itemID] = Number(shoppingCart[itemID] + itemCount) || itemCount;
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  updateShoppingCartWindow();
}

function removeItemFromShoppingCart(itemID) {
  const shoppingCart = getShoppingCart();
  delete shoppingCart[itemID];
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  updateShoppingCartWindow();
}

function clearShoppingCart() {
  // remove green outline from added items
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  Object.keys(shoppingCart).forEach(itemID => {
    const productCard = document.querySelector(`.product-card[data-item-id="${itemID}"]`);
    productCard.classList.remove("in-basket");
  });

  localStorage.setItem("shoppingCart", JSON.stringify({}));
  updateShoppingCartWindow();
}

function updateShoppingCartWindow() {
  const shoppingCartPanel = document.querySelector(".cart-item-list");
  const subtotalLabel = document.querySelector("#subtotal-value");
  subtotalLabel.textContent = "";

  const inventory = JSON.parse(sessionStorage.getItem("inventory"));
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));

  let subTotal = 0;
  let itemsCountTotal = 0;
  let htmlPayload = ``;
  Object.keys(shoppingCart).forEach(itemID => {
    const item = inventory.find(item => item.id === Number(itemID));

    const itemCount = Number(shoppingCart[itemID]);
    const itemTotal = item.price.value * itemCount;

    subTotal += itemTotal;
    itemsCountTotal += itemCount;
    htmlPayload += `
    <div class="cart-item">
      <h4>${item.title}</h4>
      <div class="cart-item-summary">
        <span data-item-id="${item.id}" class="item-price">${item.price.value}</span> ${item.price.currency} x
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="${itemCount}" /> =
        <span data-item-id="${item.id}" class="item-stack-price">${itemTotal}</span> kr
      </div>
      <button data-item-id="${item.id}" class="remove-cart-item">x</button>
    </div>`;
  });

  subtotalLabel.textContent = subTotal;

  const itemsCountLabel = document.querySelector("#cart-item-count");
  itemsCountLabel.textContent = itemsCountTotal;

  if (htmlPayload.length === 0) {
    document.querySelector(".cart-empty-message").style.display = "block";
    shoppingCartPanel.innerHTML = "";
  } else {
    document.querySelector(".cart-empty-message").style.display = "none";
    shoppingCartPanel.innerHTML = htmlPayload;
  }

  // add event listeners to all item quantity input fields
  const stackInputs = document.querySelectorAll(".cart-item input.cart-item-qty");
  for (var i = 0; i < stackInputs.length; i++) {
    stackInputs[i].addEventListener("change", onCartItemStackUpdated);
  }

  // add event listeners to all X buttons
  const addToCartButtons = document.querySelectorAll(".cart-item button.remove-cart-item");
  for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", onDeleteCartItem);
  }
}

function onCartItemStackUpdated(event) {
  const input = event.currentTarget;
  const itemID = input.dataset.itemId;
  const newStackSize = Number(input.value);

  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  const inventory = JSON.parse(sessionStorage.getItem("inventory"));

  // save new stack size
  shoppingCart[itemID] = newStackSize;
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));

  // update number of items in cart
  const newItemCount = Object.values(shoppingCart).reduce((sum, value) => sum + Number(value), 0);
  document.querySelector("#cart-item-count").textContent = newItemCount;

  // update new price total for this item
  let itemPrice = inventory.find(item => item.id === Number(itemID)).price.value;
  document.querySelector(`.item-stack-price[data-item-id="${itemID}"]`).textContent = itemPrice * newStackSize;

  // update sub total for the entire cart
  const newSubTotalValue = Object.keys(shoppingCart).reduce((total, id) => {
    const item = inventory.find(item => item.id === Number(id));
    return total + item.price.value * shoppingCart[id];
  }, 0);
  document.querySelector(`#subtotal-value`).textContent = newSubTotalValue;
}

function onDeleteCartItem(event) {
  const button = event.currentTarget;
  const itemID = button.dataset.itemId;
  removeItemFromShoppingCart(itemID);
  const productCard = document.querySelector(`.product-card[data-item-id="${itemID}"]`);
  productCard.classList.remove("in-basket");
}

function onToOrderClick() {
  const shoppingCart = getShoppingCart();
  if (Object.keys(shoppingCart).length > 0) location.href = "/order.html";
}
