announce = [];
announce[0] = "Janitor applications are now open! Click <a href = \"/.static/janitor.html\">here</a> to apply.";

function globalAnnounce() {
    document.getElementById("globalAnnouncement").innerHTML += (announce[0]);

}

globalAnnounce();