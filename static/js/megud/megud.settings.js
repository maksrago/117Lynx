//
// Setting functions
//

function getSetting(Name) {
  if (typeof(Storage) !== "undefined") {
    return localStorage.getItem(Name);
  }
  var re = new RegExp(Name + "=[^;]+", "i"); //construct RE to search for target name/value pair
  if (document.cookie.match(re)) //if cookie found
    return document.cookie.match(re)[0].split("=")[1] //return its value
  return null
}

function setSetting(name, value, days) {
  //console.log('setting', name, value, days);
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(name, value)
  } else {
    var expireDate=new Date()
        //set "expstring" to either future or past date, to set or delete cookie, respectively
    var expstring=(typeof days!="undefined")?expireDate.setDate(expireDate.getDate()+parseInt(days)):expireDate.setDate(expireDate.getDate()-5)
    document.cookie=name+"="+value+"; expires="+expireDate.toGMTString()+"; path=/";
  }
}

function deleteSetting(name) {
  if (typeof(Storage) !== "undefined") {
    localStorage.removeItem(name);
  } else {
    setCookie(name, "moot")
  }
}
