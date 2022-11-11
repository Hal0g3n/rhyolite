function closeOtherTabs() {
    chrome.tabs.query({ 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (otherTabs) {
        var otherTabIds = []; for (tab of otherTabs) { otherTabIds.push(tab.id); }
        chrome.tabs.remove(otherTabIds); window.close();
    });
}

function openTab() {
    chrome.tabs.create({url: 'index.html'});
}

function jumpToHome() {
    chrome.tab.highlight()
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