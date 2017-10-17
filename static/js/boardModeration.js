var boardIdentifier;

if (!DISABLE_JS) {

  document.getElementById('transferJsButton').style.display = 'inline';
  document.getElementById('deleteJsButton').style.display = 'inline';
  document.getElementById('saveSpecialJsButton').style.display = 'inline';

  document.getElementById('saveSpecialFormButton').style.display = 'none';
  document.getElementById('deleteFormButton').style.display = 'none';
  document.getElementById('transferFormButton').style.display = 'none';

  boardIdentifier = document.getElementById('boardTransferIdentifier').value;

}

function transferBoard() {

  apiRequest('transferBoardOwnership', {
    login : document.getElementById('fieldTransferLogin').value.trim(),
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/' + boardIdentifier + '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function deleteBoard() {
  apiRequest('deleteBoard', {
    boardUri : boardIdentifier,
    confirmDeletion : document.getElementById('confirmDelCheckbox').checked
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      window.location.pathname = '/';

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function saveSpecialSettings() {

  var specialSettings = [];

  if (document.getElementById('checkboxSfw').checked) {
    specialSettings.push('sfw');
  }

  if (document.getElementById('checkboxLocked').checked) {
    specialSettings.push('locked');
  }

  apiRequest('setSpecialBoardSettings', {
    boardUri : boardIdentifier,
    specialSettings : specialSettings
  }, function requestComplete(status, data) {

    if (status === 'ok') {
      alert('Special settings saved');
    } else {
      alert(status + ': ' + JSON.stringify(data));
    }

  });

}