function loadJsonByFetch(url, callback) {
  fetch(url)
    .then(resp => resp.json())
    .then(json => callback(json))
    .catch(err => console.error(err));
}

function loadJsonByXhr(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(JSON.parse(this.responseText));
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}
