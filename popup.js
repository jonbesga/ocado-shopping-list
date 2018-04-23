function export_shopping_list(id, cb) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.ocado.com/webshop/webservices/shoppingLists/${id}/`);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && this.status == 200) {
            cb(JSON.parse(this.responseText));
        }
    };
    xhr.send()
}

function add_to_basket(sku, quantity) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.ocado.com/webshop/addToBasket.do');
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(`&ajax=ajax&quantity=${quantity}&sku=${sku}`)
}

let exportBtn = document.getElementById('export');
let importBtn = document.getElementById('import');
let savedList = document.getElementById('saved-lists');

exportBtn.onclick = function(element){
    chrome.tabs.getSelected(null, function (tab) {
        shoppingListId = tab.url.split('https://www.ocado.com/webshop/shoppingLists/')[1].split('/display.go')[0]
        export_shopping_list(shoppingListId, function(response){
            let li = document.createElement('li');
            li.innerText = shoppingListId
            savedList.appendChild(li);
            
            let values = JSON.stringify(response);
            localStorage.setItem('ocado_shopping_list', values);
            alert('Shopping list copied! Now go to other Ocado account and select import')
        })
    });
}

importBtn.onclick = function (element) {
    let shopping_list = JSON.parse(localStorage.getItem('ocado_shopping_list'))
    for (section of shopping_list.listItems.sections) {
        for (product of section.fops){
            add_to_basket(product.sku, parseInt(product.fopAttributes.suggested_quantity))
        }
    }
}