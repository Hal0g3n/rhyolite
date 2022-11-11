function jumpToHome() {
    chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
        console.log(tab);
        chrome.tab.highlight(tab);
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