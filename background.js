

// Add context menu items
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
      title: "Go to marked position",
      contexts: ["browser_action"],
      onclick: function() {
        sendAction("scrollTo");
      }
});
chrome.contextMenus.create({
      id: "autoScroll",
      title: "Turn off scroll on reload",
      contexts: ["browser_action"]
});

var scrollmarks_autoScroll = undefined
getAutoScroll(false)


// handle incoming messages
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.action) {
      case "scrollMarked":
        chrome.browserAction.setIcon({
            path: "icons/opaqueIcon.png"
        }, errorCallback);

        chrome.browserAction.setTitle({
            title: "Click to unmark scroll position"
        });
        return;

      case "scrollUnmarked":
        chrome.browserAction.setIcon({
            path: "icons/transparentIcon.png"
        }, errorCallback);

        chrome.browserAction.setTitle({
            title: "Click to mark scroll position"
        });
        return;

      case "checkToScroll":
        if (scrollmarks_autoScroll === undefined) {
          getAutoScroll(true)
        } else if (scrollmarks_autoScroll) {
          sendAction("scrollTo")
        }
        

      default:
        return;

    }
  }
);

function errorCallback() {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
    }
}

chrome.browserAction.onClicked.addListener(function () {
  sendAction("addOrRemoveScrollmark")
})

chrome.tabs.onActivated.addListener(function () {
  sendAction("getScrollmark")
})

chrome.windows.onFocusChanged.addListener(function () {
  sendAction("getScrollmark")
})

chrome.runtime.onStartup.addListener(function () {
  sendAction("getScrollmark")
  getAutoScroll()
})

chrome.runtime.onInstalled.addListener(function () {
  sendAction("getScrollmark")

  var autoScroll = {}
  autoScroll["scrollmarks_auto"] = true
  chrome.storage.sync.set(autoScroll, function() {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }
    getAutoScroll(false)
  })
})

// sendAction api
function sendAction(actionString) {
  chrome.tabs.query({active: true, currentWindow: true}, 
    function(tabs) {
      if (tabs[0].id === undefined) {
        console.log(actionString)
      }
      chrome.tabs.sendMessage(tabs[0].id, {action: actionString})
    }
  );
}


// get autoScroll
function getAutoScroll(scrollTo) {
  chrome.storage.sync.get("scrollmarks_auto", function (items) {
    if (items["scrollmarks_auto"]) {
      turnOnAutoScroll(scrollTo)
    } else {
      turnOffAutoScroll(scrollTo)
    }
  });
}


// turn off automatic scrolling
var turnOffAutoScroll = function (scrollTo) {
  scrollmarks_autoScroll = false
  chrome.contextMenus.update("autoScroll", {
    title: "Turn on scroll on reload",
    onclick: turnOnAutoScroll
  })

  if (scrollTo) {
    sendAction("scrollTo")
  }

  var autoScroll = {}
  autoScroll["scrollmarks_auto"] = false
  chrome.storage.sync.set(autoScroll, errorCallback)
}

// turn on automatic scrolling
var turnOnAutoScroll = function (scrollTo) {
  scrollmarks_autoScroll = true
  chrome.contextMenus.update("autoScroll", {
    title: "Turn off scroll on reload",
    onclick: turnOffAutoScroll
  })

  if (scrollTo) {
    sendAction("scrollTo")
  }

  var autoScroll = {}
  autoScroll["scrollmarks_auto"] = true
  chrome.storage.sync.set(autoScroll, errorCallback)
}