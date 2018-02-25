announce = [];
announce[0] = "Banner contest is now live over <a href = \"/meta/res/28.html\">here</a>.";

function globalAnnounce() {
    document.getElementById("globalAnnouncement").innerHTML += (announce[0]);

}

globalAnnounce();