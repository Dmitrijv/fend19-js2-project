$(document).ready(function() {
  // load shop items from local json file
  const INVENTORY_DIR = "json/inventory.json";
  if (Modernizr.fetch) {
    shopLib.loadJsonByFetch(INVENTORY_DIR, loadStore);
  } else {
    shopLib.loadJsonByXhr(INVENTORY_DIR, loadStore);
  }
});

function getShoppingCart() {
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  return !shoppingCart || Object.keys(shoppingCart).length === 0 ? {} : shoppingCart;
}

function loadStore(productsJson) {
  shopLib.setInventory(productsJson);
  const shoppingCart = getShoppingCart();

  let htmlPayload = ``;
  const productPanel = document.querySelector(".product-panel .panel-body");

  // generate item HTML and append it to store panel
  productsJson.forEach(item => {
    const inBasketFlag = shoppingCart[item.id] ? "in-basket" : "";
    htmlPayload += `
    <div data-item-id="${item.id}" class="product-card ${inBasketFlag}">
      <div class="product-description-wrapper">
          <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
          <h4 class="product-name">${item.title}</h4>
          <p class="product-description">${item.description}</p>
      </div>
      <div class="product-interaction-wrapper">
        <hr />
        <p class="product-price"><span class='product-price-value'>${item.price.value}</span> ${item.price.currency}</p>
        <button data-item-id="${item.id}" type="button" class="btn btn-success">Add to cart</button>
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="1" />
      </div>
    </div>`;
  }); // end of iterating through shop inventory

  productPanel.innerHTML = htmlPayload.length > 0 ? htmlPayload : "Failed to load store items.";

  // add event listeners to "Add to cart" buttons
  const addToCartButtons = document.querySelectorAll(".product-panel .panel-body button[data-item-id]");
  for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", clickAddToCartButton);
  }

  // make possible adding items to cart by pressing inter while choosing stack size
  const productStackInputFields = document.querySelectorAll(".product-panel .panel-body input[data-item-id]");
  for (var i = 0; i < productStackInputFields.length; i++) {
    productStackInputFields[i].addEventListener("keyup", onKeyPressedInInputElement);
  }

  document.querySelector("#clear-cart-button").addEventListener("click", clearShoppingCart);
  document.querySelector("#to-order-button").addEventListener("click", onToOrderClick);

  updateShoppingCartWindow();
}

function onKeyPressedInInputElement(event) {
  if (event.keyCode === 13) {
    const inputField = event.currentTarget;
    const itemID = inputField.dataset.itemId;

    const itemCount = Number(document.querySelector(`input[data-item-id="${itemID}"]`).value);
    if (!itemCount || itemCount < 0) {
      inputField.value = 1;
      return;
    }

    addItemToShoppingCart(itemID, itemCount);
    document.querySelector(`.product-card[data-item-id="${itemID}"]`).classList.add("in-basket");
  }
}

function clickAddToCartButton(event) {
  const button = event.currentTarget;
  const itemID = button.dataset.itemId;
  const itemCount = Number(document.querySelector(`input[data-item-id="${itemID}"]`).value);
  addItemToShoppingCart(itemID, itemCount);
  document.querySelector(`.product-card[data-item-id="${itemID}"]`).classList.add("in-basket");
}

function addItemToShoppingCart(itemID, itemCount) {
  const shoppingCart = getShoppingCart();
  shoppingCart[itemID] = Number(shoppingCart[itemID] + itemCount) || itemCount;
  shopLib.setShoppingCart(shoppingCart);
  updateShoppingCartWindow();
}

function removeItemFromShoppingCart(itemID) {
  const shoppingCart = shopLib.getShoppingCart();
  delete shoppingCart[itemID];
  shopLib.setShoppingCart(shoppingCart);
  updateShoppingCartWindow();
}

function clearShoppingCart() {
  // remove green outline from added items
  const shoppingCart = shopLib.getShoppingCart();
  Object.keys(shoppingCart).forEach(itemID => {
    const productCard = document.querySelector(`.product-card[data-item-id="${itemID}"]`);
    productCard.classList.remove("in-basket");
  });

  shopLib.clearShoppingCart();
  updateShoppingCartWindow();
}

function updateShoppingCartWindow() {
  const shoppingCartPanel = document.querySelector(".cart-item-list");

  const inventory = shopLib.getInventory();
  const shoppingCart = shopLib.getShoppingCart();

  let totalPrice = 0;
  let totalItemCount = 0;
  let htmlPayload = ``;
  Object.keys(shoppingCart).forEach(itemID => {
    const item = inventory.find(item => item.id === Number(itemID));

    const itemCount = Number(shoppingCart[itemID]);
    const stackPrice = item.price.value * itemCount;

    totalPrice += stackPrice;
    totalItemCount += itemCount;
    htmlPayload += `
    <div class="cart-item">
      <h4>${item.title}</h4>
      <div class="cart-item-summary">
        <span data-item-id="${item.id}" class="item-price">${item.price.value}</span> ${item.price.currency} x
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="${itemCount}" /> =
        <span data-item-id="${item.id}" class="item-stack-price">${stackPrice}</span> kr
      </div>
      <button data-item-id="${item.id}" class="remove-cart-item">x</button>
    </div>`;
  });

  document.querySelector("#subtotal-value").textContent = totalPrice;
  document.querySelector("#cart-item-count").textContent = totalItemCount;

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

  // add event listeners to all "X" buttons
  const addToCartButtons = document.querySelectorAll(".cart-item button.remove-cart-item");
  for (var i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", onDeleteCartItem);
  }

  // disable checkout button if no items are in the cart
  if (Object.keys(shoppingCart).length == 0) {
    document.querySelector("#to-order-button").setAttribute("disabled", "");
  } else {
    document.querySelector("#to-order-button").removeAttribute("disabled");
  }
}

function onCartItemStackUpdated(event) {
  const input = event.currentTarget;
  const itemID = input.dataset.itemId;

  let newStackSize = Number(input.value);
  // set default stack size to 1 if input is invalid
  if (!newStackSize || newStackSize < 0) {
    input.value = 1;
    newStackSize = 1;
  }

  const shoppingCart = shopLib.getShoppingCart();
  const inventory = shopLib.getInventory();

  shoppingCart[itemID] = newStackSize;
  shopLib.setShoppingCart(shoppingCart);

  // update total number of items in the cart
  const newItemCount = Object.values(shoppingCart).reduce((sum, value) => sum + Number(value), 0);
  document.querySelector("#cart-item-count").textContent = newItemCount;

  // update new price total for this item
  let itemPrice = inventory.find(item => item.id === Number(itemID)).price.value;
  document.querySelector(`.item-stack-price[data-item-id="${itemID}"]`).textContent = (
    itemPrice * newStackSize
  ).toFixed(2);

  // update sub total for the entire cart
  const newSubTotalValue = Object.keys(shoppingCart)
    .reduce((total, id) => {
      const item = inventory.find(item => item.id === Number(id));
      return total + item.price.value * shoppingCart[id];
    }, 0)
    .toFixed(2);

  document.querySelector(`#subtotal-value`).textContent = newSubTotalValue;
}

function onDeleteCartItem(event) {
  const button = event.currentTarget;
  const itemID = button.dataset.itemId;
  removeItemFromShoppingCart(itemID);
  document.querySelector(`.product-card[data-item-id="${itemID}"]`).classList.remove("in-basket");
}

function onToOrderClick() {
  const shoppingCart = shopLib.getShoppingCart();
  if (Object.keys(shoppingCart).length > 0) location.href = "/order.html";
}
