function jumpToHome() {
    chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
        chrome.tabs.update(tab[0].id, { active: true });
    });
}

function createTab(id) {
    chrome.tabs.create({ url: "./index.html", windowId: id, active: false, pinned: true }, (tab) => {
        chrome.tabs.move(tab.id, { index: 0 });
    })
}

chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case 'Jump to Home':
            jumpToHome();
            break;
        default:
            console.log(`Command ${command} not found`);
    }
});

// when a new window is created, open index.html
chrome.windows.onCreated.addListener((window) => {
    createTab(window.id)
});


// Check on startup if any windows lack the page
chrome.windows.getAll((windows) => {
    for (window of windows) {
        createTab(window.id)
        chrome.tabs.query({windowId: window.id}, (tabs) => {
            console.log("Window:", window.id, tabs)
            if (tabs.length == 0) return;
            chrome.tabs.remove(tabs[0].id);
        })
    }
});

// chrome.contextMenus.removeAll();
// chrome.contextMenus.create({
//       title: "first",
//       contexts: ["browser_action"],
//       onclick: function() {
//         alert('first');
//       }
// });