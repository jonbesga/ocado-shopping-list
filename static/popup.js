function downloadDataAsFile(data) {
    const json_data = JSON.parse(data)
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url,
        filename: `${json_data.name}.ocs`,
        saveAs: true,
    });
}

function checkOrMoveToShoppingListPage(tab, cb){
    if (tab.url !== 'https://www.ocado.com/webshop/shoppingLists/display.go') {
        chrome.tabs.update(tab.id, { 
            url: 'https://www.ocado.com/webshop/shoppingLists/display.go'
        });
    }
    callback()
}

let saveBtn = document.getElementById('save');
let loadBtn = document.getElementById('load');
let downloadBtn = document.getElementById('download');
let uploadBtn = document.getElementById('upload');


saveBtn.onclick = function(element){
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, 'saveToLocalStorage', function (response) {
        })
    })
}

loadBtn.onclick = function (element) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, 'loadFromLocalStorage', function (response) {
        })
    })
}

downloadBtn.onclick = function (element) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, 'download', downloadDataAsFile);
    })
}

uploadBtn.onclick = function(){
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, 'upload', function (response) {
        });
    })
}