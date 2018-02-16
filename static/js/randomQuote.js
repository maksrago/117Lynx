quotes = [];
quotes[0] = "At least 117 times better than anything else";
quotes[1] = ">tfw no gf";
quotes[2] = "Finally, at long last, I can show the world my true worth.";

function randomQuote() {
    var index;

    index = Math.floor(Math.random() * quotes.length);
    document.getElementById("randomQuote").innerHTML += (quotes[index]);


}

randomQuote();