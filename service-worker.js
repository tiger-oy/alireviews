chrome.runtime.onInstalled.addListener(function (details) {
    console.log('onInstalled:' + details.reason);
    if (details.reason == "install") {
        openOptions();
    }

});

chrome.action.onClicked.addListener(openOptions)

function openOptions() {
    chrome.tabs.create({ active: true, url: "./options.html" });
}
