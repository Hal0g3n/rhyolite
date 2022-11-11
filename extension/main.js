function main() {
    // do amogus
    const amogus = document.getElementById("amogus");
    amogus.addEventListener("click", function(event) {
        closeOtherTabs();
        openTab("https://amogus.surge.sh");
    })
}

window.addEventListener("load", main);