var boardIdentifier;

if (!DISABLE_JS) {

  var volunteerCellTemplate = '<span class="userLabel"></span> ';
  volunteerCellTemplate += '<input ';
  volunteerCellTemplate += 'type="hidden" ';
  volunteerCellTemplate += 'class="userIdentifier" ';
  volunteerCellTemplate += 'name="login">';
  volunteerCellTemplate += '<input ';
  volunteerCellTemplate += 'type="hidden" ';
  volunteerCellTemplate += 'class="boardIdentifier" ';
  volunteerCellTemplate += 'name="boardUri">';
  volunteerCellTemplate += '<input ';
  volunteerCellTemplate += 'type="hidden" ';
  volunteerCellTemplate += 'name="add" ';
  volunteerCellTemplate += 'value=false>';
  volunteerCellTemplate += '<input ';
  volunteerCellTemplate += 'type="button" ';
  volunteerCellTemplate += 'class="removeJsButton" ';
  volunteerCellTemplate += 'value="Remove Volunteer" ';
  volunteerCellTemplate += 'class="hidden"> ';
  volunteerCellTemplate += '<input ';
  volunteerCellTemplate += 'type="submit" ';
  volunteerCellTemplate += 'class="removeFormButton" ';
  volunteerCellTemplate += 'value="Remove Volunteer">';

  if (document.getElementById('ownerControlDiv')) {

    document.getElementById('addVolunteerJsButton').style.display = 'inline';
    document.getElementById('transferBoardJsButton').style.display = 'inline';
    document.getElementById('deleteBoardJsButton').style.display = 'inline';
    document.getElementById('cssJsButton').style.display = 'inline';
    document.getElementById('spoilerJsButton').style.display = 'inline';
    document.getElementById('spoilerFormButton').style.display = 'none';
    document.getElementById('cssFormButton').style.display = 'none';
    document.getElementById('deleteBoardFormButton').style.display = 'none';
    document.getElementById('addVolunteerFormButton').style.display = 'none';
    document.getElementById('transferBoardFormButton').style.display = 'none';

    if (document.getElementById('customJsForm')) {
      document.getElementById('jsJsButton').style.display = 'inline';

      document.getElementById('jsFormButton').style.display = 'none';
    }

    var volunteerDiv = document.getElementById('volunteersDiv');

    for (var i = 0; i < volunteerDiv.childNodes.length; i++) {
      processVolunteerCell(volunteerDiv.childNodes[i]);

    }
  }

  boardIdentifier = document.getElementById('boardSettingsIdentifier').value;
  document.getElementById('closeReportsJsButton').style.display = 'inline';
  document.getElementById('closeReportsFormButton').style.display = 'none';
  document.getElementById('saveSettingsJsButton').style.display = 'inline';
  document.getElementById('saveSettingsFormButton').style.display = 'none';

}

function makeJsRequest(files) {
  apiRequest('setCustomJs', {
    files : files || [],
    boardUri : boardIdentifier,
  }, function requestComplete(status, data) {

    document.getElementById('JsFiles').type = 'text';
    document.getElementById('JsFiles').type = 'file';

    if (status === 'ok') {

      if (files) {
        alert('New javascript set.');
      } else {
        alert('Javascript deleted.');
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function setJs() {

  var file = document.getElementById('JsFiles').files[0];

  if (!file) {
    makeJsRequest();
    return;
  }

  var reader = new FileReader();

  reader.onloadend = function() {

    makeJsRequest([ {
      name : file.name,
      content : reader.result
    } ]);

  };

  reader.readAsDataURL(file);

}

function makeSpoilerRequest(files) {
  apiRequest('setCustomSpoiler', {
    files : files || [],
    boardUri : boardIdentifier,
  }, function requestComplete(status, data) {

    document.getElementById('files').type = 'text';
    document.getElementById('files').type = 'file';

    if (status === 'ok') {

      location.reload(true);

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function setSpoiler() {

  var file = document.getElementById('filesSpoiler').files[0];

  if (!file) {
    makeSpoilerRequest();
    return;
  }

  var reader = new FileReader();

  reader.onloadend = function() {

    // style exception, too simple
    makeSpoilerRequest([ {
      name : file.name,
      content : reader.result
    } ]);
    // style exception, too simple

  };

  reader.readAsDataURL(file);

}

function makeCssRequest(files) {
  apiRequest('setCustomCss', {
    files : files || [],
    boardUri : boardIdentifier,
  }, function requestComplete(status, data) {

    document.getElementById('files').type = 'text';
    document.getElementById('files').type = 'file';

    if (status === 'ok') {

      if (files) {
        alert('New CSS set.');
      } else {
        alert('CSS deleted.');
      }

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });
}

function setCss() {

  var file = document.getElementById('files').files[0];

  if (!file) {
    makeCssRequest();
    return;
  }

  var reader = new FileReader();

  reader.onloadend = function() {

    // style exception, too simple
    makeCssRequest([ {
      name : file.name,
      content : reader.result
    } ]);
    // style exception, too simple

  };

  reader.readAsDataURL(file);

}

function saveSettings() {
  var typedName = document.getElementById('boardNameField').value.trim();
  var typedDescription = document.getElementById('boardDescriptionField').value
      .trim();
  var typedMessage = document.getElementById('boardMessageField').value.trim();
  var typedAnonymousName = document.getElementById('anonymousNameField').value
      .trim();
  var typedHourlyLimit = document.getElementById('hourlyThreadLimitField').value
      .trim();
  var typedAutoCaptcha = document.getElementById('autoCaptchaThresholdField').value
      .trim();
  var typedMaxBumpAge = document.getElementById('maxBumpAgeField').value.trim();
  var typedAutoSage = document.getElementById('autoSageLimitField').value
      .trim();
  var typedFileLimit = document.getElementById('maxFilesField').value.trim();
  var typedFileSize = document.getElementById('maxFileSizeField').value.trim();
  var typedTypedMimes = document.getElementById('validMimesField').value
      .split(',');
  var typedThreadLimit = document.getElementById('maxThreadFields').value
      .trim();

  if (typedHourlyLimit.length && isNaN(typedHourlyLimit)) {
    alert('Invalid hourly limit.');
    return;
  } else if (typedMaxBumpAge.length && isNaN(typedMaxBumpAge)) {
    alert('Invalid maximum age for bumping.');
    return;
  } else if (typedAutoCaptcha.length && isNaN(typedAutoCaptcha)) {
    alert('Invalid auto captcha treshold.');
    return;
  } else if (!typedName.length || !typedName.length) {
    alert('Both name and description are mandatory.');
    return;
  } else if (typedMessage.length > 256) {
    alert('Message too long, keep it under 256 characters.');
    return;
  }

  var settings = [];

  if (document.getElementById('blockDeletionCheckbox').checked) {
    settings.push('blockDeletion');
  }

  if (document.getElementById('requireFileCheckbox').checked) {
    settings.push('requireThreadFile');
  }

  if (document.getElementById('disableIdsCheckbox').checked) {
    settings.push('disableIds');
  }

  if (document.getElementById('allowCodeCheckbox').checked) {
    settings.push('allowCode');
  }

  if (document.getElementById('early404Checkbox').checked) {
    settings.push('early404');
  }

  if (document.getElementById('uniquePostsCheckbox').checked) {
    settings.push('uniquePosts');
  }

  if (document.getElementById('uniqueFilesCheckbox').checked) {
    settings.push('uniqueFiles');
  }

  if (document.getElementById('unindexCheckbox').checked) {
    settings.push('unindex');
  }

  if (document.getElementById('forceAnonymityCheckbox').checked) {
    settings.push('forceAnonymity');
  }

  if (document.getElementById('textBoardCheckbox').checked) {
    settings.push('textBoard');
  }

  var typedTags = document.getElementById('tagsField').value.split(',');

  var combo = document.getElementById('captchaModeComboBox');

  var locationCombo = document.getElementById('locationComboBox');

  apiRequest(
      'setBoardSettings',
      {
        boardName : typedName,
        captchaMode : combo.options[combo.selectedIndex].value,
        boardMessage : typedMessage,
        autoCaptchaLimit : typedAutoCaptcha,
        locationFlagMode : locationCombo.options[locationCombo.selectedIndex].value,
        hourlyThreadLimit : typedHourlyLimit,
        tags : typedTags,
        anonymousName : typedAnonymousName,
        boardDescription : typedDescription,
        boardUri : boardIdentifier,
        settings : settings,
        autoSageLimit : typedAutoSage,
        maxThreadCount : typedThreadLimit,
        maxFileSizeMB : typedFileSize,
        acceptedMimes : typedTypedMimes,
        maxFiles : typedFileLimit,
      }, function requestComplete(status, data) {

        if (status === 'ok') {

          location.reload(true);

        } else {
          alert(status + ': ' + JSON.stringify(data));
        }
      });

}

function processVolunteerCell(cell) {
  var button = cell.getElementsByClassName('removeJsButton')[0];
  button.style.display = 'inline';
  cell.getElementsByClassName('removeFormButton')[0].style.display = 'none';

  button.onclick = function() {
    setVolunteer(cell.getElementsByClassName('userIdentifier')[0].value, false);
  };

}

function addVolunteer() {
  setVolunteer(document.getElementById('addVolunteerFieldLogin').value.trim(),
      true, function(error) {

        if (error) {
          alert(error);
        } else {
          document.getElementById('addVolunteerFieldLogin').value = '';
        }

      });

}

function setVolunteersDiv(volunteers) {
  var volunteersDiv = document.getElementById('volunteersDiv');

  while (volunteersDiv.firstChild) {
    volunteersDiv.removeChild(volunteersDiv.firstChild);
  }

  for (var i = 0; i < volunteers.length; i++) {

    var cell = document.createElement('form');
    cell.innerHTML = volunteerCellTemplate;

    cell.getElementsByClassName('userIdentifier')[0].setAttribute('value',
        volunteers[i]);

    cell.getElementsByClassName('userLabel')[0].innerHTML = volunteers[i];

    cell.getElementsByClassName('boardIdentifier')[0].setAttribute('value',
        boardIdentifier);

    processVolunteerCell(cell);

    volunteersDiv.appendChild(cell);
  }
}

function refreshVolunteers() {

  localRequest('/boardManagement.js?json=1&boardUri=' + boardIdentifier,
      function gotData(error, data) {

        if (error) {
          alert(error);
        } else {

          var parsedData = JSON.parse(data);

          setVolunteersDiv(parsedData.volunteers || []);

        }

      });

}

function setVolunteer(user, add, callback) {

  apiRequest('setVolunteer', {
    login : user,
    add : add,
    boardUri : boardIdentifier
  }, function requestComplete(status, data) {

    if (status === 'ok') {

      if (callback) {
        callback();
      }

      refreshVolunteers();

    } else {
      alert(status + ': ' + JSON.stringify(data));
    }
  });

}

function transferBoard() {

  apiRequest('transferBoardOwnership', {
    login : document.getElementById('transferBoardFieldLogin').value.trim(),
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