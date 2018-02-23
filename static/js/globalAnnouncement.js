announce = [];
announce[0] = "Janitor applications are now open! Click <a href = \"/.static/janitor.html\">here</a> to apply. <br />Janitor applications are now open! Banner contest is now live over <a href = \"/meta/res/28.html\">here</a>.";

function globalAnnounce() {
    document.getElementById("globalAnnouncement").innerHTML += (announce[0]);

}

globalAnnounce();