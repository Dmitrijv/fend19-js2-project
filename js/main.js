$(document).ready(function() {
  const INVENTORY_DIR = "json/inventory.json";
  // load shop items from local json file
  if (Modernizr.fetch) {
    loadJsonByFetch(INVENTORY_DIR, loadStore);
  } else {
    loadJsonByXhr(INVENTORY_DIR, loadStore);
  }
});

function loadStore(productsJson) {
  const productPanel = document.querySelector(".product-panel .panel-body");

  // generate item HTML and append it to store panel
  let htmlPayload = ``;
  productsJson.forEach(item => {
    htmlPayload += `
    <div class="product-card">
        <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="${item.title}" />
        <h4 id="product-name">${item.title}</h4>
        <p>${item.description}</p>
        <hr />
        <p class="product-price">${item.price.value} ${item.price.currency}</p>
        <div>
        <button data-item-id="${item.id}" type="button" class="btn btn-success">Add to cart</button>
        <input data-item-id="${item.id}" type="number" min="1" max="1000" class="cart-item-qty" value="1" />
        </div>
    </div>`;
  });
  productPanel.innerHTML = htmlPayload.length > 0 ? htmlPayload : "Failed to load store items.";

  // add event listeners to "Add to cart" all buttons
  const addToCartButtons = document.querySelectorAll(".product-panel .panel-body button[data-item-id]");
  addToCartButtons.forEach(button => {
    button.addEventListener("click", clickAddToCartButton);
  });
}

function clickAddToCartButton(e) {
  const thisButton = event.currentTarget;
  const productID = thisButton.dataset.itemId;
  console.log("Added product " + productID + " to cart");
}
