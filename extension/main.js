function closeOtherTabs() {
    chrome.tabs.query({ 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, function (otherTabs) {
        var otherTabIds = []; for (tab of otherTabs) { otherTabIds.push(tab.id); }
        chrome.tabs.remove(otherTabIds); window.close();
    });
}

function openTab(url) {
    chrome.tabs.create({ url: url });
}

function main() {
    const button = document.getElementById("button");
    button.addEventListener("click", function(event) {
        closeOtherTabs();
        openTab("https://amogus.surge.sh");
    })
}

window.addEventListener("load", main);