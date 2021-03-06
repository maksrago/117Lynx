var themes = [ {
  file : 'yotsuba.css',
  label : 'Yotsuba',
  id : 'yotsuba'
}, {
  file : 'yotsuba_b.css',
  label : 'Yotsuba B',
  id : 'yotsuba b'
}, {
  file : 'proton.css',
  label : 'Proton',
  id : 'proton'
}, {
  file : 'happyday.css',
  label : 'Happy Day',
  id : 'happyday'
}, {
  file : 'sfw.css',
  label : 'Safe For Work',
  id : 'safeforwork'
} ];

var addedTheme;

function updateCss() {

  if (addedTheme) {
    addedTheme.parentNode.removeChild(addedTheme);
    addedTheme = null;
  }

  for (var i = 0; i < themes.length; i++) {
    var theme = themes[i];

    if (theme.id === localStorage.selectedTheme) {
      addedTheme = theme.element;
      document.head.appendChild(theme.element);
    }
  }

}

if (!DISABLE_JS) {

  for (var i = 0; i < themes.length; i++) {
    themes[i].element = document.createElement('link');
    themes[i].element.type = 'text/css';
    themes[i].element.rel = 'stylesheet';
    themes[i].element.href = '/.static/css/' + themes[i].file;
  }

  updateCss();

  var postingLink = document.getElementById('navPosting');

  if (postingLink) {

    var referenceNode = postingLink.nextSibling;

    postingLink.parentNode.insertBefore(document.createTextNode(''),
        referenceNode);

    var divider = document.createElement('span');
    divider.innerHTML = '/&nbsp;';
    postingLink.parentNode.insertBefore(divider, referenceNode);

    postingLink.parentNode.insertBefore(document.createTextNode(''),
        referenceNode);

    var themeSelector = document.createElement('select');
    themeSelector.id = 'themeSelector';

    var vanillaOption = document.createElement('option');
    vanillaOption.innerHTML = 'Tomorrow';
    themeSelector.appendChild(vanillaOption);

    for (i = 0; i < themes.length; i++) {

      var theme = themes[i];

      var themeOption = document.createElement('option');
      themeOption.innerHTML = theme.label;

      if (theme.id === localStorage.selectedTheme) {
        themeOption.selected = true;
      }

      themeSelector.appendChild(themeOption);

    }

    themeSelector.onchange = function() {

      if (!themeSelector.selectedIndex) {

        if (localStorage.selectedTheme) {

          delete localStorage.selectedTheme;

          updateCss();
        }

        return;
      }

      var selectedTheme = themes[themeSelector.selectedIndex - 1];

      if (selectedTheme.id === localStorage.selectedTheme) {
        return;
      }

      localStorage.selectedTheme = selectedTheme.id;

      updateCss();

    };

    postingLink.parentNode.insertBefore(themeSelector, referenceNode);

  }

}