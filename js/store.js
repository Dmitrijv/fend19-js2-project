$(document).ready(function() {
  // load shop items from local json file
  const INVENTORY_DIR = "json/inventory.json";
  if (Modernizr.fetch) {
    shopLib.loadJsonByFetch(INVENTORY_DIR, loadStore);
  } else {
    shopLib.loadJsonByXhr(INVENTORY_DIR, loadStore);
  }
});

function loadStore(productsJson) {
  shopLib.setInventory(productsJson);
  const shoppingCart = shopLib.getShoppingCart();

  // generate item HTML and append it to store panel
  const productPanel = document.querySelector(".product-panel .panel-body");
  productsJson.forEach(item => {
    const inBasketFlag = shoppingCart[item.id] ? "in-basket" : "";

    let cardHtml = `
    <div data-item-id="${item.id}" class="product-card ${inBasketFlag}">
      <div class="product-description-wrapper">
          <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
          <h4 class="product-name">${item.title}</h4>
          <p class="product-description">${item.description}</p>
      </div>
      <div class="product-interaction-wrapper">
        <hr />
        <p class="product-price"><span class='product-price-value'>${item.price.value}</span> ${item.price.currency}</p>
        <button data-item-id="${item.id}" type="button" class="btn btn-success">Lägg i kundvagnen</button>
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="1" />
      </div>
    </div>`;

    const itemCard = new DOMParser().parseFromString(cardHtml, "text/html");
    itemCard.querySelector("button[data-item-id]").addEventListener("click", clickAddToCartButton);
    itemCard.querySelector("input[data-item-id]").addEventListener("keyup", onKeyPressedInInputElement);
    productPanel.appendChild(itemCard.querySelector("div.product-card"));
  }); // end of iterating through shop inventory

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
  const shoppingCart = shopLib.getShoppingCart();
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
  const inventory = shopLib.getInventory();
  const shoppingCart = shopLib.getShoppingCart();

  const shoppingCartPanel = document.querySelector(".cart-item-list");
  Object.keys(shoppingCart).forEach(itemID => {
    const item = inventory.find(item => item.id === Number(itemID));
    const itemCount = Number(shoppingCart[itemID]);
    const stackPrice = (item.price.value * itemCount).toFixed(2);

    const itemHtml = `
    <div class="cart-item">
      <h4>${item.title}</h4>
      <div class="cart-item-summary">
      <img class="product-cover-small" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
      
        <span data-item-id="${item.id}" class="item-price">${item.price.value}</span> ${item.price.currency} x
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="${itemCount}" /> =
        <span data-item-id="${item.id}" class="item-stack-price">${stackPrice}</span> kr
      </div>
      <button data-item-id="${item.id}" class="remove-cart-item"><svg class="svg-icon" viewBox="0 0 20 20">
      <path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
    </svg></button>
    </div>`;

    const listItem = new DOMParser().parseFromString(itemHtml, "text/html");
    listItem.addEventListener("change", onCartItemStackUpdated);
    listItem.addEventListener("click", onDeleteCartItem);
    shoppingCartPanel.appendChild(listItem.querySelector("div.cart-item"));
  }); // end of iterating through cart items

  // update the number of items in the cart
  document.querySelector("#cart-item-count").textContent = Object.values(shoppingCart).reduce(
    (sum, value) => sum + Number(value),
    0
  );

  // update price sub total
  document.querySelector(`#subtotal-value`).textContent = Object.keys(shoppingCart)
    .reduce((total, id) => {
      const item = inventory.find(item => item.id === Number(id));
      return total + item.price.value * shoppingCart[id];
    }, 0)
    .toFixed(2);

  // show "Cart is empty message" if the cart is empty
  if (Object.keys(shoppingCart).length === 0) {
    document.querySelector(".cart-empty-message").style.display = "block";
    shoppingCartPanel.innerHTML = "";
  } else {
    document.querySelector(".cart-empty-message").style.display = "none";
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
