announce = [];
announce[0] = "Janitor applications are now open! Click <a href = \"/.static/janitor.html\">here</a> to apply. <br />Loli/Shota has been unbanned.";

function globalAnnounce() {
    document.getElementById("globalAnnouncement").innerHTML += (announce[0]);

}

globalAnnounce();