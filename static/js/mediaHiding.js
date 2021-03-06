var hiddenMediaRelation = {};

if (!DISABLE_JS) {

  var shownFiles = document.getElementsByClassName('uploadCell');

  for (var i = 0; i < shownFiles.length; i++) {
    processFileForHiding(shownFiles[i]);
  }

  var hiddenMedia = getHiddenMedia();

  for (i = 0; i < hiddenMedia.length; i++) {
    updateHiddenFiles(hiddenMedia[i], true);
  }

}

function getHiddenMedia() {

  var hiddenMedia = localStorage.hiddenMedia;

  if (hiddenMedia) {
    hiddenMedia = JSON.parse(hiddenMedia);
  } else {
    hiddenMedia = [];
  }

  return hiddenMedia;

}

function updateHiddenFiles(file, hiding) {

  var mediaObject = hiddenMediaRelation[file] || [];

  for (var i = 0; i < mediaObject.length; i++) {

    var element = mediaObject[i];

    element.button.innerHTML = hiding ? '(Open File)' : '(Hide File)';
    if (element.element.style.display === 'none' && hiding) {

      var hideLinkList = element.element.parentNode
          .getElementsByClassName('hideLink');

      if (hideLinkList.length) {
        hideLinkList[0].onclick();
      }
    }

    element.element.style.display = hiding ? 'none' : 'inline';
  }

}

function processFileForHiding(file) {

  var nameLink = file.getElementsByClassName('nameLink')[0];

  var hidingButton = document.createElement('a');
  hidingButton.innerHTML = '(Hide file)';
  hidingButton.className = 'hideFileButton glowOnHover coloredIcon';

  var fileName = nameLink.href.split('/');
  fileName = fileName[fileName.length - 1];

  var mediaObject = hiddenMediaRelation[fileName] || [];

  mediaObject.push({
    button : hidingButton,
    element : file.getElementsByClassName('imgLink')[0]
  });

  hiddenMediaRelation[fileName] = mediaObject;

  hidingButton.onclick = function() {

    var hiddenMedia = getHiddenMedia();

    var alreadyHidden = hiddenMedia.indexOf(fileName) > -1;

    if (alreadyHidden) {
      hiddenMedia.splice(hiddenMedia.indexOf(fileName), 1);
    } else {
      hiddenMedia.push(fileName);
    }

    localStorage.hiddenMedia = JSON.stringify(hiddenMedia);

    updateHiddenFiles(fileName, !alreadyHidden);

  };

  nameLink.parentNode.insertBefore(hidingButton, nameLink.nextSibling);

}