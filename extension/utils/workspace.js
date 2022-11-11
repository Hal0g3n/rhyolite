export class Workspace {
    active_tabs = [];

    stored_tabs = {
        section: [
            "link"
        ]
    }

    restore() {
        active_tabs.forEach((tab) =>
            chrome.tabs.create({
                active: false,
                url: tab.url
            })
        );

        toggleListeners();
    }
    
    async shutoff() {
        toggleListeners();
        
        var home = await chrome.tabs.query({ currentWindow: true, index: 0 });
        
        await chrome.tabs.query({ 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
            function (otherTabs) {
                for (const tab of otherTabs) if (home.id != tab.id)
                chrome.tabs.remove(otherTabIds);
                
                window.close();
            }
        );
    }
}