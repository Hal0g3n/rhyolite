async function closeOtherTabs() {
    let [cur] = await chrome.tabs.query(queryOptions);
    console.log(cur)
    chrome.tabs.query(
        { 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
        function (otherTabs) {
            const otherTabIds = [];
            for (const tab of otherTabs) if (cur.id != tab.id) otherTabIds.push(tab.id);
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
    const button = document.getElementById("button");
    button.addEventListener("click", function(event) {
        closeOtherTabs();
        openTab("https://amogus.surge.sh");
    })
}

window.addEventListener("load", main);