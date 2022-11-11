// importScripts("./utils/util.js", "./utils/workspace.js");

chrome.storage.sync.get("data", function (item) {
  console.log(item);
});

const exampleW = [{
  name: "Sus domesticus"
}];

const exampleT = [
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
exampleW.forEach((workspace) => {
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

exampleT.forEach((ob) => {
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