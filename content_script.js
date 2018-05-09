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
    .then(function(values){
        window.location.href = 'https://www.ocado.com/webshop/displaySmartBasket.do'
    }).catch(function(error){
        console.log('error: ', error)
    })
}

let fileChooser = document.createElement("input");
fileChooser.type = 'file';
fileChooser.style.display = 'none';

fileChooser.addEventListener('change', function (evt) {
    const fileList = this.files;
    let reader = new FileReader();

    reader.onload = function (file) {
        const jsonFileData = JSON.parse(file.target.result)
        add_shopping_list_to_basket(jsonFileData)
    }

    reader.readAsText(fileList[0]);

});

document.body.appendChild(fileChooser);
fileChooser.click();


