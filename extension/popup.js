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

async function deleteWorkspace(name) {
  if (workspaces == null) workspaces = await getFromLocalStorage("workspaces");
  if (workspaces == null) {
    workspaces = [];
  }
  if (!workspaces.includes(name)) return;
  workspaces = workspaces.filter(e => e != name);
  await setToLocalStorage({ workspaces: workspaces });
  await deleteFromLocalStorage(name);
}

async function removeAllWorkspaces() {
  const workspaces = await getFromLocalStorage("workspaces");
  workspaces.forEach(w => deleteWorkspace(w));
}
removeAllWorkspaces();

function click() {
  removeAllWorkspaces();
}

document.getElementById("click").addEventListener("click", click);