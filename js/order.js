$(document).ready(function() {
  const shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
  const inventory = JSON.parse(sessionStorage.getItem("inventory"));
  let orderList = document.querySelector(".order-list");
  let subTotal = 0;
  let itemsCountTotal = 0;
  orderList.innerHTML = ``;

  Object.keys(shoppingCart).forEach(itemID => {
    const item = inventory.find(item => item.id === Number(itemID));
    const itemCount = shoppingCart[itemID];
    const itemTotal = item.price.value * itemCount;

    subTotal += itemTotal;
    itemsCountTotal += itemCount;
    orderList.innerHTML += `
      <tr>
        <td class="item-name">${item.title}</td>
        <td class="item-qty">${itemCount}</td>
        <td class="item-price">${item.price.value} kr</td>
        <td class="item-total">${itemTotal} kr</td>
      </tr>`;
  });

  orderList.innerHTML += `
    <tr class="font-bold">
      <td>Totalt:</td>
      <td class="products-amount"></td>
      <td></td>
      <td class="item-total" >${subTotal} kr</td>
    </tr >
    </tbody>
    `;

  document.querySelector(".products-amount").innerHTML = itemsCountTotal;

  const confirmButton = document.querySelector(".confirm-order-button");
  if (itemsCountTotal === 0) {
    confirmButton.setAttribute("aria-disabled", true);
    confirmButton.classList.add("disabled");
    confirmButton.setAttribute("disabled", "");
  } else {
    confirmButton.setAttribute("aria-disabled", false);
    confirmButton.classList.remove("disabled");
    confirmButton.removeAttribute("disabled");
  }

  confirmButton.addEventListener("click", onOrderConfirmedClick);
});

function onOrderConfirmedClick(event) {
  if (confirm("Vill du bekräfta din order?")) {
    localStorage.setItem("shoppingCart", JSON.stringify({}));
    alert("Tack för din order!");
    location.href = "/index.html";
  } else {
    event.preventDefault();
  }
}
