function get_json_shopping_list(id, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.ocado.com/webshop/webservices/shoppingLists/${id}/`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && this.status == 200) {
            cb(this.responseText);
        }
    };
    xhr.send()
}

function add_to_basket(sku, quantity) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.ocado.com/webshop/addToBasket.do');
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(this.status)
            }
            else {
                reject(this)
            }

        };

        xhr.send(`&ajax=ajax&quantity=${quantity}&sku=${sku}`)
    })
}

function add_shopping_list_to_basket(data) {
    let ajax_requests = []
    for (section of data.listItems.sections) {
        for (product of section.fops) {
            ajax_requests.push(add_to_basket(product.sku, parseInt(product.fopAttributes.suggested_quantity)))
        }
    }

    Promise.all(ajax_requests)
        .then(function (values) {
            window.location.href = 'https://www.ocado.com/webshop/displaySmartBasket.do'
        }).catch(function (error) {
            console.log('error: ', error)
        })
}

let saveBtn = document.getElementById('save');
let loadBtn = document.getElementById('load');
let downloadBtn = document.getElementById('download');
let uploadBtn = document.getElementById('upload');


function checkOrMoveToShoppingListPage(tab, cb){
    if (tab.url !== 'https://www.ocado.com/webshop/shoppingLists/display.go') {
        chrome.tabs.update(tab.id, { 
            url: 'https://www.ocado.com/webshop/shoppingLists/display.go'
        });
    }
    callback()
}

saveBtn.onclick = function(element){
    chrome.tabs.getSelected(null, function (tab) {
        checkOrMoveToShoppingListPage(tab, function(){
            
        })
    });
}

loadBtn.onclick = function (element) {
    console.log('Clicked! load')
}


downloadBtn.onclick = function (element) {
    chrome.tabs.getSelected(null, function (tab) {
        const shoppingListId = tab.url.split('https://www.ocado.com/webshop/shoppingLists/')[1].split('/display.go')[0]

        get_json_shopping_list(shoppingListId, function(response){
            const json_response = JSON.parse(response)
            const blob = new Blob([response], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            
            chrome.downloads.download({
                url,
                filename: `${json_response.name}.ocs`,
                saveAs: true,
            });
        })
    })
}

uploadBtn.addEventListener("click", function(){
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.executeScript(tab.id, { file: "content_script.js" });
    });
});