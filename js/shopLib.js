shopLib = (function() {
  const info = "shopLib.js är ett bibliotek med hjälp funktioner";
  const version = "0.1";
  let shopLib = {
    loadJsonByXhr: function(url, callback) {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          callback(JSON.parse(this.responseText));
        }
      };
      xhr.open("GET", url, true);
      xhr.send();
    },

    loadJsonByFetch: function(url, callback) {
      fetch(url)
        .then(resp => resp.json())
        .then(json => callback(json))
        .catch(err => console.error(err));
    },

    random: function(min, max) {
      returnMath.floor(Math.random() * (max + 1 - min) + min);
    }
  };
  return shopLib;
})();