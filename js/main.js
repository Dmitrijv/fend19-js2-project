$(document).ready(function () {


    // load shop items from json file
    const inventoryDir = "json/inventory.json";

    if (Modernizr.fetch) {
        fetch(inventoryDir).then(resp => resp.json()).then(json => console.log(json)).catch(err => console.error(err));
    } else {
        // load the old school way
    }



});


