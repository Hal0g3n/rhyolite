// Jump to first page
function jumpToHome() {
    chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
        chrome.tabs.update(tab[0].id, { active: true });
    });
}

function closeOtherTabs() {
    var home = chrome.tabs.query({ currentWindow: true, index: 0 });
    chrome.tabs.query(
        { 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (otherTabs) {
            for (const tab of otherTabs) if (home.id != tab.id)
                chrome.tabs.remove(otherTabIds);

            window.close();
        }
    );
}

// Opens the stored away tabs in the workspace
function openSavedTabs(urls) {
    urls.forEach((url) => 
        chrome.tabs.create({
            active: false,
            url: url
        })
    );
}


// Creates the Home Tab (pinned) in the given window
function createPinnedTab(id) {
    chrome.tabs.create({ url: "./index.html", windowId: id, active: false, pinned: true }, (tab) => {
        chrome.tabs.move(tab.id, { index: 0 });
    })
}