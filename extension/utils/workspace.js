importScripts("./utils/util.js")
class Workspace {
    active_tabs = [
        { id: "1034", name: "google", url: "https://www.google.com"}
    ];

    stored_tabs = {
        section: [
            {id: "1034", name: "google", url: "https://www.google.com" }
        ],
        section2: [
            {id: "1034", name: "google", url: "https://www.google.com" }
        ]
    }
};

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
    if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
    if (!workspaces.includes(name)) return;
    
    setToLocalStorage({[`${name}`]: {
        active_links: [],
        stored_tabs: {}
    }});
    
    // Add to array and update storage
    workspaces.push(name);
    setToLocalStorage({workspaces: workspaces});
}

async function switchWorkspace(next) {
    if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
    if (!workspaces.includes(next)) return;
    
    // Remove all unrelated tabs
    await chrome.tabs.query(
        { 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (otherTabs) {
            // If tab is not the extension tab, remove it
            for (const tab of otherTabs)
                if (!tab.url.includes(chrome.runtime.id))
                    chrome.tabs.remove(tab.id);
            
            window.close();
        }
    );
    
    // Get active links to open
    openSavedTabs((await getFromLocalStorage(next)).active_links)
    currentWorkspace = next;
}

async function deleteWorkspace(name) {
    if (workspaces == null) workspaces = await getFromLocalStorage("workspaces")
    if (!workspaces.includes(name)) return;

    // remove from array and update storage
    workspaces = workspaces.filter(e => e != name);
    setToLocalStorage({ workspaces: workspaces });
    chrome.storage.local.remove(name);

    // Switch out if necessary
    if (currentWorkspace != name) return;

    // Nothing to switch out, L bozo
    if (workspaces.length == 0) currentWorkspace = null;
    else switchWorkspace(workspaces[0]);
}


async function onTabCreated(tab) {
    let workspace = await getFromLocalStorage(currentWorkspace)
    workspace.active_links.push({
        id: tab.id,
        name: tab.title,
        url: tab.url
    })

    setToLocalStorage(currentWorkspace, workspace)
}

async function onTabRemoved(tabId, info) {
    let workspace = (await getFromLocalStorage(currentWorkspace)).filter(e => 
        e.id != tabId
    );

    setToLocalStorage(currentWorkspace, workspace)
}

async function onTabMoved(tabId, info) {
    let workspace = await getFromLocalStorage(currentWorkspace)
    let moved = workspace.active_links[info.fromIndex]
    
    workspace = workspace.filter(e, ind => ind != info.fromIndex)
    workspace.splice(info.toIndex, 0, moved);
    
    setToLocalStorage(currentWorkspace, workspace)
}

async function onTabUpdated(tabId, info) {
    let workspace = await getFromLocalStorage(currentWorkspace)
    for (let tab of workspace.active_tabs) {
        if (tab.id != tabId) continue;

        tab.name = info.title
        tab.url = info.url;
    }
}

chrome.tabs.onMoved.addListener(onTabMoved);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.tabs.onDetached.addListner(onTabRemoved);
chrome.tabs.onCreated.addListener(onTabCreated);
chrome.tabs.onUpdated.addListener(onTabUpdated);

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