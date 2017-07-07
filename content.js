
// if a scroll mark exists, scrolls to it
var scrollmarks_key = "scrollmarks_" + window.location.href;
var scrollmarks_position = undefined;
scrollmarks_getPosition(false)
chrome.runtime.sendMessage({action: "checkToScroll"});

// save or remove scroll mark
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch (request.action) {

			case "addOrRemoveScrollmark":

				// add scroll mark
				if (scrollmarks_position === undefined) {
					scrollmarks_position = [window.scrollX, window.scrollY]
					var keyCoords = {}
					keyCoords[scrollmarks_key] = [window.scrollX, window.scrollY]
					chrome.storage.sync.set(keyCoords, function() {
						if (chrome.runtime.lastError !== undefined) {
							chrome.runtime.sendMessage({message: chrome.runtime.lastError})
						} else {
							chrome.runtime.sendMessage({action: "scrollMarked"});
						}
					});
				}

				// remove scroll mark
				else {
					scrollmarks_position = undefined
					chrome.storage.sync.remove([scrollmarks_key, scrollmarks_key], function() {
						if (chrome.runtime.lastError !== undefined) {
							chrome.runtime.sendMessage({message: chrome.runtime.lastError})
						} else {
							chrome.runtime.sendMessage({action: "scrollUnmarked"});
						}
					});
				}
				break;

			case "getScrollmark":
				scrollmarks_getPosition(false)
				break;

			case "scrollTo":
				scrollmarks_getPosition(true);
				break;

			default:
				break;

		}
	}
);

function scrollmarks_getPosition (scrollmarks_andScroll) {
	chrome.storage.sync.get(scrollmarks_key, function (items) {

		// scroll to the scroll mark
		if (items[scrollmarks_key] !== undefined) {
			scrollmarks_position = [items[scrollmarks_key][0], items[scrollmarks_key][1]]
			chrome.runtime.sendMessage({action: "scrollMarked"})
			if (scrollmarks_andScroll) {
				window.scrollTo(items[scrollmarks_key][0], items[scrollmarks_key][1]);
			}
		}

		// change icon
		else {
			chrome.runtime.sendMessage({action: "scrollUnmarked"})
		}
	});
}

