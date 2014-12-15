(function () {
  var HOME_URL = 'http://twitter.com';
  var NOTIFICATIONS_URL = 'https://twitter.com/i/notifications';
  
  // XHR helper function
  var xhr = function () {
    var xhr = new XMLHttpRequest();
    return function(method, url, callback) {
      xhr.onreadystatechange = function () {
        // request finished and response is ready
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            callback(false);
          }
          callback(xhr.responseText);
        }
      };
      xhr.open(method, url);
      xhr.send();
    };
  }();

  // main function
  window.NotificationsCount = function (callback) {
    var tmpDom = document.createElement('div');

    xhr('GET', HOME_URL, function (data) {
      var notifElem, countElem;
      tmpDom.innerHTML = data;

      // no data
      if (data === false) {
        callback(false);
      }

      notifElem = tmpDom.querySelector('a[href="/i/notifications"]');
      if (notifElem) {
        countElem = tmpDom.querySelector('span.count-inner');
        if (countElem) {
          callback(countElem.textContent);
        } else {
          callback('0');
        }
      }
      else {
        callback(false);
      }
    });
  };

  // badge renderer
  function render(badge, color, title) {
    chrome.browserAction.setBadgeText({
      text: badge
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
    chrome.browserAction.setTitle({
      title: title
    });
  }

  // update badge
  function update() {
    NotificationsCount(function (count) {
      if (count !== false) {
        //console.log(count);
        render((count !== '0' ? count : ''), [208, 0, 24, 255], chrome.i18n.getMessage('browserActionDefaultTitle', count));
      } else {
        render('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
      }
    });
  }

  // Chrome alarm
  chrome.alarms.create({periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(update);

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
      url: NOTIFICATIONS_URL
    });
    update();
  });

  update();
})();