// importScripts("./utils/util.js", "./utils/workspace.js");

try {
  chrome.storage.sync.get("data", function (item) {
    console.log(item);
  });
} catch (e) {
  // wow! error is caught here.
}

const exampleWorkspaces = [{
  name: "Sus domesticus"
}];
const exampleChecklist = [{title: "Sevastopol", checked: true},{title: "Krakow", checked: true}];

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
const tasksp = document.getElementById("tasksp");
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
      //do stuff I am retarded
    } else {
      
    }
  })
}