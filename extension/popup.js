

let data = null;

function update() {

}

function load_data() {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let [key, { old, value }] of Object.entries(changes)) {
      if (key === "data") {
        data = JSON.parse(value);
        update();
      }
    }
  });
  chrome.storage.sync.get(["data"], (value) => {
    data = JSON.parse(value);
    update();
  });
}

function fuzzysearch() {
  
  fuzzysort.go()
  
}

function main() {



}

window.addEventListener("load", main);