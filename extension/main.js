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

function main() {
    const button = document.getElementById("button");
    button.addEventListener("click", function(event) {
        chrome.tabs.create({ url: url });
    })
}

window.addEventListener("load", main);