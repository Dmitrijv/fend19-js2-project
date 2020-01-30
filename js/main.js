$(document).ready(function () {


    // load shop items from json file
    const inventoryDir = "json/inventory.json";
    fetch(inventoryDir).then(resp => resp.json()).then(json => console.log(json)).catch(err => console.error(err));


});


