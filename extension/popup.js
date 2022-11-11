

let data = null;
let workspaces = [];

function getFromLocalStorage(key) {
  return new Promise(resolve => {
    chrome.storage.sync.get(key, function(item) {
      resolve(item[key]);
    });
  });
}

function setToLocalStorage(value) {
  return new Promise(resolve => {
    chrome.storage.sync.set({ key: value }, function() {
      if (chrome.runtime.lastError)
        alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
      resolve();
    });
  });
}

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