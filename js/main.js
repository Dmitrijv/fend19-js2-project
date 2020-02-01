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
  //   console.log(productsJson);
  const productPanel = document.querySelector(".product-panel .panel-body");
  let htmlPayload = ``;
  productsJson.forEach(item => {
    console.log(item);
    htmlPayload += `
    <div class="product-card">
        <img class="img-fluid product-cover" src="img/product/product-${item.id}.jpg" alt="product${item.id}" />
        <h4 id="product-${item.id}-name">${item.title}</h4>
        <p id="product-2-description">${item.description}</p>
        <hr />
        <p class="product-price" id="prouct-2-price">${item.price}</p>
        <div>
        <button type="button" value="" class="btn btn-success">Add to cart</button>
        <input type="number" min="1" max="1000" class="cart-item-qty" value="1" />
        </div>
    </div>`;
  });
  productPanel.innerHTML = htmlPayload || "Failed to load store items.";
}
