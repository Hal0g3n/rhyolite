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

/** <Storage Functionz> **/

function getFromLocalStorage(key) {
  return new Promise(resolve => {
      chrome.storage.sync.get(key, function (item) {
          resolve(item[key]);
      });
  });
}

function setToLocalStorage(values) {
  chrome.storage.sync.set(values, function () {
    if (chrome.runtime.lastError)
      alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
  });
}

let currentWorkspace = "";
let workspaces = null;
let active_links = ((await chrome.tabs.query({})).map(
  e => ({id: e.id, name: e.title, url: e.url})
));
active_links = active_links.filter(e => !e.url.includes(chrome.runtime.id))

async function createWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  } else {
    if (!workspaces.includes(name)) return;
  }
  if (workspaces.includes(name)) return;

  setToLocalStorage({[`${name}`]: {
      active_links: active_links,
      stored_tabs: {}
  }});

  // add to array and update storage
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

  // Set active_linksto open
  active_links = (await getFromLocalStorage(next)).active_links;
  
  // Get active links to open
  openSavedTabs(active_links);
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
  if (tab.url.includes(chrome.runtime.id)) return;

  active_links.push({
    id: tab.id,
    name: tab.title,
    url: tab.url
  })

  // Update workspace if applicable
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links
  setToLocalStorage(currentWorkspace, workspace);
}

async function onTabRemoved(tabId, info) {
  active_links = active_links.filter(e => e.id != tabId);

  // Update workspace if applicable
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links
  setToLocalStorage(currentWorkspace, workspace);
}

async function onTabMoved(tabId, info) {
  let moved = active_links[info.fromIndex]
  active_links.splice(info.fromIndex, 1);
  active_links.splice(info.toIndex, 0, moved);

  // Update workspace if applicable
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links
  setToLocalStorage(currentWorkspace, workspace);;
}

async function onTabUpdated(tabId, tab, info) {
  if (tab == undefined) return;

  for (let tab of active_links) {
    if (tab.id != tabId) continue;

    tab.name = info.title;
    tab.url = info.url;
  }
  
  // Update workspace if applicable
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links
  setToLocalStorage(currentWorkspace, workspace);
}

try {

  // add listeners (isn't it obvious?)
  chrome.tabs.onMoved.addListener(onTabMoved);
  chrome.tabs.onRemoved.addListener(onTabRemoved);
  chrome.tabs.onDetached.addListener(onTabRemoved);
  chrome.tabs.onCreated.addListener(onTabCreated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);

chrome.storage.onChanged.addListener(console.log);

  // testing...
  console.log(await getFromLocalStorage("workspaces"));

} catch (e) {
  // wow! error is totally caught here.
  console.error(e);
}

const exampleWorkspaces = [{
  name: "Sus domesticus"
}];
const exampleChecklist = [{title: "Sevastopol", checked: true},{title: "Krakow", checked: true}];

const tabsp = document.getElementById("tabsp");
const workspaceBox = document.getElementById("yaw");
const exampleTabs = [
  {
    url: "https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
    title: "chill"
  }, {
    url: "https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
    title: "chill"
  }
];

const tasksp = document.getElementById("tasksp");

function generate_workspaces(workspaces) {
  const workspaceBox = document.getElementById("workspacebox");
  // clear workspace box
  [...workspaceBox.children].forEach((child) => child.remove());
  workspaces.forEach((workspace_name) => {
    // add stuff
    const workspace_item = document.createElement("a");
    workspace_item.style.cursor = "pointer";
    workspace_item.textContent = workspace_name;
    workspaceBox.appendChild(workspace_item);
  });
}

// `try` to generate
try {
  generate_workspaces(await getFromLocalStorage("workspaces") || []);
} catch (e) {
  console.error(e);
}

function do_tabpane() {

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

  document.querySelectorAll(".tablinks").forEach((tab) => {
    tab.addEventListener("click", function(event) {
      openTab(event, tab.getAttribute("open_id"));
    });
  });

}
do_tabpane();

function do_tabs() {

  exampleTabs.forEach((ob) => {
    const tabsp = document.getElementById("tabsp");
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

}
do_tabs();

function do_checklist() {
  const tasksp = document.getElementById("tasksp");
  for (let i = 0; i < exampleChecklist.length; i++) {
    const tabDiv = document.createElement("div");
    tabDiv.innerHTML = `
      <input type="checkbox" class="checkbox1" name="c${i}" checked="${exampleChecklist[i].checked}">
      <label class="checklist1Label" for="c${i}">${exampleChecklist[i].title}</label><br>
    `;
    tasksp.appendChild(tabDiv);
  }
  const t = document.getElementsByClassName("");
  for (let i = 0; i < t.length; i++){
    t[i].addEventListener('change', function() {
      if (this.checked) {
        // do stuff I am retarded (no)
      } else {
        
      }
    })
  }
}
do_checklist();

function do_addnew() {
  const addnew = document.getElementById("addnew");
  const addnewtext = document.getElementById("addnewtext");
  addnew.style.cursor = "pointer";
  addnew.addEventListener("click", function(event) {
    addnewtext.style.display = "block";
    addnewtext.value = "";
    addnewtext.focus();
    addnew.style.display = "none";
  });
  let valid = false;
  async function create() {
    if (!valid) return;
    const workspaceName = addnewtext.value;
    try {
      await createWorkspace(workspaceName);
    } catch (e) {
      console.error(e);
    }
    addnew.style.display = "block";
    addnewtext.style.display = "none";
  }
  addnewtext.addEventListener("input", function(event) {
    valid = /^[a-zA-Z0-9_]+$/.test(addnewtext.value);
  });
  addnewtext.addEventListener("keydown", async function(event) {
    if (event.code === "Enter") {
      await create();
    }
  });
}
do_addnew();

function do_storagelistener() {

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // if (namespace !== "sync") return;
    for (let [key, { old, value }] of Object.entries(changes)) {
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed.`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
      if (key === "workspaces") {
        generate_workspaces(value);
        console.log("WORKSPACES");
      }
    }
  });

}
do_storagelistener();