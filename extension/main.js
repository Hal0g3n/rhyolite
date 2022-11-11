async function closeOtherTabs() {

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

function openTab(url) {
    chrome.tabs.create({
        active: false,
        url: url
    });
}

function main() {
    // do amogus
    const amogus = document.getElementById("amogus");
    amogus.addEventListener("click", function(event) {
        closeOtherTabs();
        openTab("https://amogus.surge.sh");
    })
}

window.addEventListener("load", main);