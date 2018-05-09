function get_json_shopping_list(id, cb) {
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.ocado.com/webshop/webservices/shoppingLists/${id}/`);
    xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            cb(this.responseText)
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

function add_shopping_list_to_basket(data, callback) {
    console.log(data, typeof(data))
    let ajax_requests = []
    for (section of data.listItems.sections) {
        for (product of section.fops) {
            ajax_requests.push(add_to_basket(product.sku, parseInt(product.fopAttributes.suggested_quantity)))
        }
    }

    Promise.all(ajax_requests)
    .then(function(values){
        callback()
    }).catch(function(error){
        console.log('error: ', error)
    })
}

function uploadShoppingList(){
    let fileChooser = document.createElement("input");
    fileChooser.type = 'file';
    fileChooser.style.display = 'none';

    fileChooser.addEventListener('change', function (evt) {
        const fileList = this.files;
        let reader = new FileReader();

        reader.onload = function (file) {
            const jsonFileData = JSON.parse(file.target.result)
            add_shopping_list_to_basket(jsonFileData, function(){
                window.location.href = 'https://www.ocado.com/webshop/displaySmartBasket.do'
            })
        }

        reader.readAsText(fileList[0]);

    });

    document.body.appendChild(fileChooser);
    fileChooser.click();
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('listener activated')
    
    if (request == "upload"){
        uploadShoppingList()
    }
    else if(request == 'download'){
        const shoppingListId = window.location.href.split('https://www.ocado.com/webshop/shoppingLists/')[1].split('/display.go')[0]
        get_json_shopping_list(shoppingListId, sendResponse)
    }
    else if(request == 'saveToLocalStorage'){
        const shoppingListId = window.location.href.split('https://www.ocado.com/webshop/shoppingLists/')[1].split('/display.go')[0]
        get_json_shopping_list(shoppingListId, function (response) {
            localStorage.setItem('ocado_shopping_list', response);
            alert('Shopping list copied! Now go to other Ocado account and select import')
        })
    }
    else if(request == 'loadFromLocalStorage'){
        let shopping_list = JSON.parse(localStorage.getItem('ocado_shopping_list'))
        add_shopping_list_to_basket(shopping_list, function(){
            window.location.href = 'https://www.ocado.com/webshop/displaySmartBasket.do'
            alert('Shopping list loaded')
        })
    }
    return true
});

console.log('Ocado shopping list extension loaded')