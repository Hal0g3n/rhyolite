function jumpToHome() {
    chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
        chrome.tabs.update(tab[0].id, { active: true });
    });
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
chrome.windows.onCreated.addListener(function() {
    chrome.tabs.create({url: "./index.html" });
});

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
      title: "first",
      contexts: ["browser_action"],
      onclick: function() {
        alert('first');
      }
});