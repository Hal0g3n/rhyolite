class Workspace {
    active_tabs = [
        {name: "google", url: "https://www.google.com"}
    ];

    stored_tabs = {
        section: [
            { name: "google", url: "https://www.google.com" }
        ],
        section2: [
            { name: "google", url: "https://www.google.com" }
        ]
    }
}



function getFromLocalStorage(key) {
    return new Promise(resolve => {
        chrome.storage.sync.get(key, function (item) {
            resolve(item[key]);
        });
    });
}

function setToLocalStorage(values) {
    return new Promise(resolve => {
        chrome.storage.sync.set(values, function () {
            if (chrome.runtime.lastError)
                alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
            resolve();
        });
    });
}

let currentWorkspace = "";
let workspaces = null;

async function createWorkspace(name) {
    if (workspaces == null) 
        workspaces = await getFromLocalStorage("workspaces")
    
    setToLocalStorage({name: {
        active_links: [],
        stored_tabs: {}
    }})
}

async function switchWorkspace(next) {

}

async function deleteWorkspace(name) {

}


let onTabCreated = function(tab) {

}

let onTabRemoved = function(tabId, info) {

}

let onTabMoved = function(tabId, info) {

}


chrome.tabs.onMoved.addListener(onTabMoved);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.tabs.onDetached.addListner(onTabRemoved);
chrome.tabs.onCreated.addListener(onTabCreated);

function update() {

}

function load_data() {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
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