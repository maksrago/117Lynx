if (!DISABLE_JS) {

  if (document.getElementById('divCreation')) {
    document.getElementById('registerJsButton').style.display = 'inline';
    document.getElementById('registerFormButton').style.display = 'none';
    document.getElementById('reloadCaptchaButton').style.display = 'inline';
  }

  document.getElementById('loginJsButton').style.display = 'inline';
  document.getElementById('recoverJsButton').style.display = 'inline';
  document.getElementById('reloadCaptchaButtonRecover').style.display = 'inline';

  document.getElementById('recoverFormButton').style.display = 'none';
  document.getElementById('loginFormButton').style.display = 'none';

}

function recoverAccount() {

  var typedLogin = document.getElementById('recoverFieldLogin').value.trim();
  var typedCaptcha = document.getElementById('fieldCaptchaRecover').value
      .trim();

  if (typedCaptcha.length !== 6 && typedCaptcha.length !== 24) {
    alert('Captchas are exactly 6 (24 if no cookies) characters long.');

  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');

  } else if (typedLogin.length) {

    apiRequest('requestAccountRecovery', {
      login : typedLogin,
      captcha : typedCaptcha
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        alert('Password request created. Check your e-mail.');

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

}

function loginUser() {

  var typedLogin = document.getElementById('loginFieldLogin').value.trim();
  var typedPassword = document.getElementById('loginFieldPassword').value;

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else {
    apiRequest('login', {
      login : typedLogin,
      password : typedPassword,
      remember : document.getElementById('checkboxRemember').checked
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        var expiration = new Date();
        expiration.setUTCFullYear(expiration.getUTCFullYear() + 1);

        var complement = '; path=/; expires=' + expiration.toUTCString();

        document.cookie = 'login=' + typedLogin + complement;
        document.cookie = 'hash=' + data + complement;

        window.location.pathname = '/account.js';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });
  }
}

function registerAccount() {

  var typedLogin = document.getElementById('registerFieldLogin').value.trim();
  var typedEmail = document.getElementById('registerFieldEmail').value.trim();
  var typedPassword = document.getElementById('registerFieldPassword').value;
  var typedCaptcha = document.getElementById('fieldCaptcha').value.trim();

  if (!typedLogin.length || !typedPassword.length) {
    alert('Both login and password are mandatory.');
  } else if (typedLogin.length > 16) {
    alert('Login too long, keep it under 16 characters.');
  } else if (typedEmail.length > 64) {
    alert('E-mail too long, keep it under 64 characters.');
  } else if (typedCaptcha.length !== 6 && typedCaptcha.length !== 24) {
    alert('Captchas are exactly 6 (24 if no cookies) characters long.');
    return;
  } else if (/\W/.test(typedCaptcha)) {
    alert('Invalid captcha.');
    return;
  } else if (/\W/.test(typedLogin)) {
    alert('Invalid login.');
  } else {

    apiRequest('registerAccount', {
      login : typedLogin,
      captcha : typedCaptcha,
      password : typedPassword,
      email : typedEmail
    }, function requestComplete(status, data) {

      if (status === 'ok') {

        var expiration = new Date();
        expiration.setUTCFullYear(expiration.getUTCFullYear() + 1);

        var complement = '; path=/; expires=' + expiration.toUTCString();

        document.cookie = 'login=' + typedLogin + complement;
        document.cookie = 'hash=' + data + complement;

        window.location.pathname = '/account.js';

      } else {
        alert(status + ': ' + JSON.stringify(data));
      }
    });

  }

}