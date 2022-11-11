function closeOtherTabs() {
    chrome.tabs.query({ 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (otherTabs) {
        var otherTabIds = []; for (tab of otherTabs) { otherTabIds.push(tab.id); }
        chrome.tabs.remove(otherTabIds); window.close();
    });
}