
const exampleW = [{
  name: "glong"
}];

const exampleT = [{
  link: "https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
  favicon: "https://s2.googleusercontent.com/s2/favicons?domain_url=https://www.youtube.com/watch?v=uzX6Mu-sCfA&t=10s",
  title: "chill"
}];

const tabsp = document.getElementById("tabsp");
const workspaceBox = document.getElementById("yaw");

//replace exampleW
exampleW.forEach((workspace) => {
    const witem = document.createElement("a");
    witem.innerHTML = workspace.name;
    workspaceBox.appendChild(witem);
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
  tabDiv.className = "tabOpenTab";
  tabDiv.innerHTML = `
  <div class="tabContainer">
  <img class="tabPaneImg" src="${ob.favicon}">
  <p class="tabTitle">${ob.title}</p>
  <p class="tabLink">${ob.link}</p>
  </div>
  `;
  tabsp.appendChild(tabDiv);
});