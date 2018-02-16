announce = [];
announce[0] = "Janitor applications are now open! Click <a href = \"#footer\">here</a> to apply.";

function globalAnnounce() {
    document.getElementById("globalAnnouncement").innerHTML += (announce[0]);

}

globalAnnounce();