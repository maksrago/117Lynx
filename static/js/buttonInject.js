var buttonContent;
var buttonBlock;
buttonContent = document.createElement('div');

buttonContent.innerHTML = '<div class = "linkBoxes"><ul><li class = "first"><a href="/">Home</a></li><li><a href="/.static/faq.html">FAQ</a></li><li><a href="/.static/globalRules.html">Rules</a></li><li><a href="/.static/contact.html">Contact</a></li><li><a href="/logs.js">Logs</a></li><li><a href="/graphs.js">Daily Graphs</a></li><li><a href="/account.js">Account</a></li><ul></div>'

buttonBlock = document.getElementById('buttonType');
buttonBlock.appendChild(buttonContent);