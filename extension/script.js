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

class Workspace {
  active_tabs = [
      { id: "1034", name: "google", url: "https://www.google.com"}
  ];

  stored_tabs = {
      section: [
          {id: "1034", name: "google", url: "https://www.google.com" }
      ],
      section2: [
          {id: "1034", name: "google", url: "https://www.google.com" }
      ]
  }
};

function getFromLocalStorage(key) {
  return new Promise(resolve => {
      chrome.storage.sync.get(key, function (item) {
          resolve(item[key]);
      });
  });
}

function setToLocalStorage(values) {
  return new Promise(resolve => {
      chrome.storage.sync.set(values, function () {
          if (chrome.runtime.lastError)
              alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
          resolve();
      });
  });
}

let currentWorkspace = "";
let workspaces = null;

async function createWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  }
  if (!workspaces.includes(name)) return;
  
  setToLocalStorage({[`${name}`]: {
      active_links: [],
      stored_tabs: {}
  }});
  
  // Add to array and update storage
  workspaces.push(name);
  setToLocalStorage({ workspaces: workspaces });
  switchWorkspace(name);
}

async function switchWorkspace(next) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    console.error("WOW, THIS SHOULD HAPPEN!!!");
    return;
  }
  if (!workspaces.includes(next)) return;
  
  // Remove all unrelated tabs
  await chrome.tabs.query(
      { 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
      function (otherTabs) {
          // If tab is not the extension tab, remove it
          for (const tab of otherTabs)
              if (!tab.url.includes(chrome.runtime.id))
                  chrome.tabs.remove(tab.id);
          
          window.close();
      }
  );
  
  // Get active links to open
  openSavedTabs((await getFromLocalStorage(next)).active_links);
  currentWorkspace = next;
}

async function deleteWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  }
  if (!workspaces.includes(name)) return;

  // remove from array and update storage
  workspaces = workspaces.filter(e => e != name);
  setToLocalStorage({ workspaces: workspaces });
  chrome.storage.sync.remove(name);

  // Switch out if necessary
  if (currentWorkspace != name) return;

  // Nothing to switch out, **L** bozo
  if (workspaces.length == 0) currentWorkspace = null;
  else switchWorkspace(workspaces[0]);
}


async function onTabCreated(tab) {
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;
  workspace.active_links.push({
      id: tab.id,
      name: tab.title,
      url: tab.url
  });

  setToLocalStorage(currentWorkspace, workspace);
}

async function onTabRemoved(tabId, info) {
  let workspace = (await getFromLocalStorage(currentWorkspace));
  if (workspace == null) return;
  workspace = workspace.filter(e => 
      e.id != tabId
  );

  setToLocalStorage(currentWorkspace, workspace);
}

async function onTabMoved(tabId, info) {
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;
  let moved = workspace.active_links[info.fromIndex];
  
  workspace = workspace.filter(e, ind => ind != info.fromIndex);
  workspace.splice(info.toIndex, 0, moved);
  
  setToLocalStorage(currentWorkspace, workspace);
}

async function onTabUpdated(tabId, info) {
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;
  for (let tab of workspace.active_tabs) {
      if (tab.id != tabId) continue;

      tab.name = info.title;
      tab.url = info.url;
  }
}

// add listeners (isn't it obvious?)
chrome.tabs.onMoved.addListener(onTabMoved);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.tabs.onDetached.addListener(onTabRemoved);
chrome.tabs.onCreated.addListener(onTabCreated);
chrome.tabs.onUpdated.addListener(onTabUpdated);

try {
  console.log(await getFromLocalStorage("workspaces"));
} catch (e) {
  // wow! error is totally caught here.
}

const exampleWorkspaces = [{
  name: "Sus domesticus"
}];

const exampleTabs = [
  {
    url: "https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
    title: "chill"
  }, {
    url: "https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
    title: "chill"
  }
];

const tabsp = document.getElementById("tabsp");
const workspaceBox = document.getElementById("yaw");

// replace exampleW
exampleWorkspaces.forEach((workspace) => {
  const workspace_item = document.createElement("a");
  workspace_item.innerHTML = workspace.name;
  workspaceBox.appendChild(workspace_item);
});

function openTab(evt, tab) {
  let tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tab).style.display = "block";
  evt.currentTarget.className += " active";
}

exampleTabs.forEach((ob) => {
  const tabDiv = document.createElement("div");
  tabDiv.className = "tabContainer";
  const { origin } = new URL(ob.url);
  tabDiv.innerHTML = `
    <img class="tabPaneImg" src="${origin}/favicon.ico">
    <div class="tabDiv">
    <p class="tabTitle">${ob.title}</p>
    <p class="tabLink">${ob.url}</p>
    </div>
  `;
  tabsp.appendChild(tabDiv);
});

document.querySelectorAll(".tablinks").forEach((tab) => {
  tab.addEventListener("click", function(event) {
    openTab(event, tab.getAttribute("open_id"));
  });
});