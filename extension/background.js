// Shortcut Command Listener
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case 'Jump to Home':
            jumpToHome();
            break;
        default:
            console.log(`Command ${command} not found`);
    }
});

// Shortcut function for jumping to first page
function jumpToHome() {
    chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
        chrome.tabs.update(tab[0].id, { active: true });
    });
}

// Creates the Home Tab (pinned) in the given window
function createTab(id) {
    chrome.tabs.create({ url: "./index.html", windowId: id, active: false, pinned: true }, (tab) => {
        chrome.tabs.move(tab.id, { index: 0 });
    })
}


// when a new window is created, create tab to go with it
chrome.windows.onCreated.addListener((window) => {
    createTab(window.id)
});

// Create tab for all windows
chrome.windows.getAll((windows) => {
    for (window of windows) {

        // Delete existing (but dead) extension tabs
        chrome.tabs.query({windowId: window.id}, (tabs) => {
            for (tab of tabs) {
                if (!tab.url.includes(chrome.runtime.id)) continue;

                // Unpin and Remove the dead tab
                chrome.tabs.update(tab.id, {pinned: false}, (tab) => chrome.tabs.remove(tab.id));
            }
        })

        // Create the tab to go with it
        createTab(window.id)
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