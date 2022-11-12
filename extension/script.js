// Jump to first page
function jumpToHome() {
  chrome.tabs.query({ currentWindow: true, index: 0 }, (tab) => {
      chrome.tabs.update(tab[0].id, { active: true });
  });
}

function limitchars(string, limit = 30) {
  if (string.length <= limit) {
    return string;
  } else {
    return string.substring(0, limit) + "...";
  }
}

async function closeOtherTabs() {
  await chrome.tabs.query(
    { 'active': false, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
    function (otherTabs) {
      // If tab is not the extension tab, remove it
      for (const tab of otherTabs)
        if (!tab.url.includes(chrome.runtime.id))
          chrome.tabs.remove(tab.id);
    }
  );
}

// Opens the stored away tabs in the workspace
function openSavedTabs(links) {
  links.forEach((link) => 
    chrome.tabs.create({
      active: false,
      url: link.url
    })
  );
}

// Creates the Home Tab (pinned) in the given window
function createPinnedTab(id) {
  chrome.tabs.query({'windowId': id}, tabs => {
      // Checks for the pinned tab
      for (const tab of tabs) if (tab.url.includes(chrome.runtime.id)) return;

      // No hav, can create
      chrome.tabs.create({ url: "./index.html", windowId: id, active: false, pinned: true }, (tab) => {
        chrome.tabs.move(tab.id, { index: 0 });
      });
    }
  );
}

/** <Storage Functionz> **/

function getFromLocalStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.get(key, function(item) {
      resolve(item[key]);
    });
  });
}

function setToLocalStorage(values) {
  return new Promise(resolve => {
    chrome.storage.local.set(values, function() {
      if (chrome.runtime.lastError)
        alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
      resolve();
    });
  });
}

function deleteFromLocalStorage(key) {
  return new Promise(resolve => {
    chrome.storage.local.remove(key, function() {
      if (chrome.runtime.lastError)
        alert(`Error saving to browser storage:\n${chrome.runtime.lastError.message}`);
      resolve();
    });
  });
}

let currentWorkspace = null;
let workspaces = null;

let active_links = ((await chrome.tabs.query({})).map(
  e => ({ id: e.id, name: e.title, url: e.url, /*icon: e.favIconUrl*/ })
));
active_links = active_links.filter(e => !e.url.includes(chrome.runtime.id) && !e.url.includes("chrome-extension"));

async function createWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  } else {
    if (workspaces.includes(name)) return;
  }
  
  await setToLocalStorage({
    [`${name}`]: {
      active_links: active_links,
      stored_tabs: {},
      tasks: {},
      notes: {}
    }
  });

  // add to array and update storage
  workspaces.push(name);
  await setToLocalStorage({ workspaces: workspaces });
  await switchWorkspace(name);

}

async function switchWorkspace(next) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    console.error("WOW, THIS CAN TOTALLY HAPPEN!!!");
    return;
  }
  if (!workspaces.includes(next)) return;
  
  currentWorkspace = next;
  
  // remove all unrelated tabs
  await closeOtherTabs();

  // get the next workspace
  const a = (await getFromLocalStorage(next));

  // set active links
  active_links = a.active_links;
  // set the checklist
  checkList = a.tasks;
  // set the notes
  notes = a.notes;

  // get active links to open
  openSavedTabs(active_links);
  await generate_everything(); 
}

async function deleteWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  }
  if (!workspaces.includes(name)) return;

  workspaces = workspaces.filter(e => e != name);
  await setToLocalStorage({ workspaces: workspaces });
  await deleteFromLocalStorage(name);

  active_links = [];
  checkList = {};
  notes = {};

  // Switch out if necessary
  if (currentWorkspace != name) return;

  // Nothing to switch out, **L** bozo
  if (workspaces.length <= 0) currentWorkspace = null;
  else await switchWorkspace(workspaces[0]);

  await generate_everything();
}

async function onTabCreated(tab) {
  console.log(currentWorkspace);
  if (tab == null || tab.url == null) return;
  if (tab.url.includes("chrome-extension://")) return;
  if (tab.url.includes(chrome.runtime.id)) return;
  // todo window id check
  // if (tab.windowId == (await chrome.windows.getCurrent()).id) return;

  active_links.push({
    id: tab.id,
    name: tab.title,
    url: tab.url
  });

  // Update workspace if applicable
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
}

async function onTabRemoved(tabId, info) {
  active_links = active_links.filter(e => e.id != tabId);

  // Update workspace if applicable
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
}

async function onTabMoved(tabId, info) {
  let moved = active_links[info.fromIndex];
  active_links.splice(info.fromIndex, 1);
  active_links.splice(info.toIndex, 0, moved);

  // Update workspace if applicable
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
}

async function onTabUpdated(tabId, info, tab) {
  if (tab == undefined || tab.url == undefined) return;
  if (tab.url.includes("chrome-extension://")) return;
  if (tab.url.includes(chrome.runtime.id)) return;

  for (const t of active_links) {
    if (t.id != tabId) continue;

    t.name = tab.title;
    t.url = tab.url;
    // t.icon = tab.favIconUrl;
  }
  
  // Update workspace if applicable
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  if (workspace == null) return;

  workspace.active_links = active_links;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
}

try {

  // add listeners (isn't it obvious?)
  chrome.tabs.onMoved.addListener(onTabMoved);
  chrome.tabs.onRemoved.addListener(onTabRemoved);
  chrome.tabs.onDetached.addListener(onTabRemoved);
  chrome.tabs.onCreated.addListener(onTabCreated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);

} catch (e) {
  // wow! error is totally caught here.
  console.error(e);
}


/** <Tasks Page> **/
let checkList = {};
async function newTask(task) {
  if (!task.replace(/\s/g, '').length) return;
  checkList[task] = false;
  
  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  
  workspace.tasks = checkList;
  
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_checklist();
}

async function setTask(task, checked) {
  checkList[task] = checked;
  
  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);
  
  workspace.tasks = checkList;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_checklist();
  
}

async function removeTask(task) {
  delete checkList[task];

  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);

  workspace.tasks = checkList;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_checklist();
}



/** <Notes Page> **/
let notes = {}
async function newNote(note) {
  if (!note.replace(/\s/g, '').length) return;
  notes[note] = "";

  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);

  workspace.notes = notes;

  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_notes();
  console.log(notes)
}

async function setNote(note, content) {
  notes[note] = content;

  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);

  workspace.notes = notes;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_notes();
}

async function removeNote(note) {
  delete notes[note];

  // Update workspace as necessary
  if (currentWorkspace == null) return;
  let workspace = await getFromLocalStorage(currentWorkspace);

  workspace.notes = notes;
  await setToLocalStorage({ [`${currentWorkspace}`]: workspace });
  await do_notes();
}

const workspaceBox = document.getElementById("yaw");

async function generate_workspaces() {
  workspaces = await getFromLocalStorage("workspaces");
  const workspaceBox = document.getElementById("workspacebox");
  // clear workspace box
  [...workspaceBox.children].forEach((child) => child.remove());
  workspaces.forEach((workspace_name) => {
    // add stuff
    const workspace_item = document.createElement("a");
    workspace_item.style.cursor = "pointer";
    workspace_item.textContent = workspace_name;
    if (currentWorkspace === workspace_name) {
      workspace_item.classList.add("currentWorkspace");      
    }
    workspace_item.addEventListener("click", async function(event) {
      currentWorkspace = workspace_name;
      closeOtherTabs();
      openSavedTabs((await getFromLocalStorage(workspace_name)).active_links);
      checkList = (await getFromLocalStorage(workspace_name)).tasks;
      await generate_everything();
    });
    workspaceBox.appendChild(workspace_item);
  });
}

async function generate_tabs() {
  let links = active_links;
  if (currentWorkspace != null) {
    const a = await getFromLocalStorage(currentWorkspace);
    if (a != null) {
      links = a.active_links;
    }
  }
  console.log(active_links);
  const tabsp = document.getElementById("tabsp");
  tabsp.innerHTML = `
    <input id="tabsearch" type="text" placeholder="search" style="width: calc(100% - 16px);">
    <div id="sus"></div>
  `;

  const sus = document.getElementById("sus");
  
  function work(L) {
    sus.textContent = "";
    L.forEach((link) => {
      if (link.obj != null) link = link.obj;
      const tab_container = document.createElement("div");
      const tab_pane_img = document.createElement("img");
      const tab_div = document.createElement("div");
      tab_pane_img.classList.add("tabPaneImg");
      try {
        const { origin } = new URL(link.url);
        tab_pane_img.src = `${origin}/favicon.ico`;
      } catch (e) {
        tab_pane_img.src = `assets/chrome.png`;
      }
      tab_pane_img.addEventListener("error", function(event) {
        tab_pane_img.src = "assets/chrome.png";
      });
      tab_container.appendChild(tab_pane_img);
      tab_div.classList.add("tabDiv");
      tab_div.innerHTML = `
        <p class="tabTitle">${link.name}</p>
        <p class="tabLink">${link.url}</p>
      `;
      tab_container.appendChild(tab_div);
      tab_container.className = "tabContainer";
      tab_container.style.cursor = "pointer";
      tab_container.addEventListener("click", function(event) {
        chrome.tabs.update(link.id, {selected: true});
      });
      sus.appendChild(tab_container);
    });
  }

  const tabsearch = document.getElementById("tabsearch");
  tabsearch.addEventListener("input", function(event) {
    const val = tabsearch.value;
    if (val.length <= 0.00000000000000000000000000000000000000000000000000000000000000000000000000001) {
      work(links);
      return;
    }
    work(fuzzysort.go(val, links, { key: "name", }));
  });

  work(links);

}

async function generate_everything() {
  await generate_workspaces();
  await generate_tabs();
  await do_checklist();
  await do_notes();
}

// `try` to generate everything
try {
  await generate_everything();
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

async function do_checklist() {
  if (currentWorkspace == null) return;
  /*
  const a = await getFromLocalStorage(currentWorkspace);
  checkList = a.tasks;
  
  */

  const tasksp = document.getElementById("tasksp");
  tasksp.textContent = "";

  Object.keys(checkList).forEach((task, i) => {
    const tabDiv = document.createElement("div");
    tabDiv.className = "toggle";
    tabDiv.style["margin"] = "10px";

    tabDiv.innerHTML = `
      <input type="checkbox" class="toggle__input" name="c${i}" ${checkList[task] ? "checked" : ""}/>
      <label class="toggle__label" for="c${i}"><span class="toggle__text">${task}</span></label><br>
    `;

    tabDiv.firstElementChild.addEventListener("change", () => setTask(task, tabDiv.firstElementChild.checked));

    const delBtn = document.createElement("img");
    delBtn.src = "./images/icons8-trash-can.svg";
    delBtn.style["height"] = "30px";
    delBtn.style["margin-left"] = "auto";
    delBtn.addEventListener("click", () => removeTask(task));
    tabDiv.appendChild(delBtn);
    tasksp.appendChild(tabDiv);
  });
 
  const inp = document.createElement("input");
  inp.className = "addTask";
  inp.addEventListener("keyup", event => {
    if (event.code !== "Enter") return;
    newTask(inp.value);
    event.preventDefault();
  });
  
  const addBtn = document.createElement("img")
  addBtn.src="./assets/plus-symbol-button.png"
  addBtn.class="iconDetails";
  addBtn.style["aspect-ratio"] = 1;
  addBtn.style["margin"] = "16px 0";
  addBtn.addEventListener("click", (event) => newTask(inp.value));
  
  const addTaskDiv = document.createElement("div");
  addTaskDiv.style["display"] = 'flex';
  addTaskDiv.appendChild(inp);
  addTaskDiv.appendChild(addBtn);
  tasksp.append(addTaskDiv);
}
do_checklist();

async function do_notes() {
  if (currentWorkspace == null) return;
  
  const notesp = document.getElementById("notesp");
  notesp.textContent = "";
  notesp.style["display"] = "grid"
  
  Object.keys(notes).forEach((note, i) => {
    const noteDiv = document.createElement("div");
    noteDiv.className = "tabContainer";
    noteDiv.classList.add("mTab")
    noteDiv.style["margin"] = "10px";

    const title = document.createElement("h2")
    title.innerHTML = `<input value = ${note}/>`
    noteDiv.appendChild(title);
    
    const content = document.createElement("textarea")
    content.value = notes[note];
    content.addEventListener("keyup", event => {
      // Ctrl + Enter shortcut
      if ((event.key != "Enter") || !event.ctrlKey) return;

      setNote(note, content.value);
      event.preventDefault();
    });
    noteDiv.appendChild(content);

    const savBtn = document.createElement("img")
    savBtn.src = "./images/save-svgrepo-com.svg";
    savBtn.classList.add("sava")
    savBtn.style["height"] = "30px";
    savBtn.style["margin-left"] = "auto";
    savBtn.addEventListener("click", () => setNote(note, content.value));
    noteDiv.appendChild(savBtn);

    const delBtn = document.createElement("img");
    delBtn.src = "./images/icons8-trash-can.svg";
    delBtn.style["height"] = "30px";
    delBtn.style["margin-left"] = "auto";
    delBtn.addEventListener("click", () => removeNote(note));
    noteDiv.appendChild(delBtn);
    notesp.appendChild(noteDiv);
  });

  const inp = document.createElement("input");
  inp.className = "addNote";
  inp.addEventListener("keyup", event => {
    if (event.code !== "Enter") return;
    newNote(inp.value);
    event.preventDefault();
  });

  const addBtn = document.createElement("img")
  addBtn.src = "./assets/plus-symbol-button.png"
  addBtn.class = "iconDetails";
  addBtn.style["aspect-ratio"] = 1;
  addBtn.style["margin"] = "16px 0";
  addBtn.addEventListener("click", () => newNote(inp.value));

  const addNoteDiv = document.createElement("div");
  addNoteDiv.style["display"] = 'flex';
  addNoteDiv.appendChild(inp);
  addNoteDiv.appendChild(addBtn);
  notesp.append(addNoteDiv);

  console.log(notesp);
}
do_notes();

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
  addnewtext.addEventListener("keydown", function(event) {
    if (event.code === "Enter") {
      create();
    }
  });
  const removecurrent = document.getElementById("removecurrent");
  removecurrent.style.cursor = "pointer";
  removecurrent.addEventListener("click", function(event) {
    if (currentWorkspace == null) return;
    deleteWorkspace(currentWorkspace);
  });
}
do_addnew();

function do_storagelistener() {

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // if (namespace !== "sync") return;
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
      if (key === "workspaces") {
        generate_workspaces();
      } else if (key === currentWorkspace) {
        generate_tabs();
        do_checklist();
      }
    }
  });

}
do_storagelistener();

/*
// remnants of stress testing (for BAD window.close debugging)
async function test() {
  for (let i = 0; i < 100; i++) {
    await setToLocalStorage({_amogus: { amogus: "among us" + i }});
  }
}
test();
*/

/*
// remnants of nth debugging session
async function test2() {
  await setToLocalStorage({_amogus: { tasks: { amogus: true }}});
}
test2();
*/

async function removeAllWorkspaces() {
  const workspaces = await getFromLocalStorage("workspaces");
  workspaces.forEach(w => deleteWorkspace(w));
}

// removeAllWorkspaces();