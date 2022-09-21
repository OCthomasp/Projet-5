main()

async function main(){
    let cart = JSON.parse(localStorage.cart);
    const articles =  await getArticles();
    showCartArticles(cart, articles);
    addEvents(cart, articles);
    updateTotals(cart, articles);

    //formulaire
    const btnValidate = document.querySelector("#order");
    let contact;
    btnValidate.addEventListener("click", function(e){
        e.preventDefault();

        // if (checkFormValidity()){
        //     console.log('valide')
        // }
        // else{
        //     console.log('pas valide')
        // }
    });

    
}

// Fetch data from api : all products
function getArticles(){
    const url = "http://localhost:3000/api/products/";
    return fetch(url)
        .then(
            function(response){
                return response.json()
            }
        )
        .then(
            function(articles_json){
                return articles_json;
            }
        )
}

// Display cart items on the page
function showCartArticles(cart, articles){
    let cart_html_holder = document.getElementById('cart__items');
    
    for(i=0; i < cart.length; i++){
        const item_index = matchIndex(cart[i].id, articles);
        
        const item_id = cart[i].id;
        const item_img = `<img src="${articles[item_index].imageUrl}" alt="${articles[item_index].altTxt}">`;
        const item_title = articles[item_index].name;
        const item_price = articles[item_index].price;
        const item_color = cart[i].color;
        let item_quantity = parseInt(cart[i].quantity);
        
        cart_html_holder.innerHTML += `
            <article class="cart__item" data-id="${item_id}" data-color="${item_color}">
                <div class="cart__item__img">
                    ${item_img}
                </div>
                <div class="cart__item__content">
                    <div class="cart__item__content__description">
                        <h2>${item_title}</h2>
                        <p>${item_color}</p>
                        <p>${item_price}€</p>
                    </div>
                    <div class="cart__item__content__settings">
                        <div class="cart__item__content__settings__quantity">
                            <p>Qté : ${item_quantity}</p>
                            <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${item_quantity}">
                        </div>
                        <div class="cart__item__content__settings__delete">
                        <p class="deleteItem">Supprimer</p>
                        </div>
                    </div>
                </div>
            </article>`;
    }
}

//Create eventListeners for all items on the page
function addEvents(cart, articles){
    for (i=0; i < cart.length; i++){
        const cart_index = i;
        const item_index = matchIndex(cart[cart_index].id, articles);
        let item_price = articles[item_index].price;
        let qtyInput = document.querySelector(`article[data-id="${cart[cart_index].id}"][data-color="${cart[cart_index].color}"] .itemQuantity`);
        let qtyLabel = document.querySelector(`article[data-id="${cart[cart_index].id}"][data-color="${cart[cart_index].color}"] .cart__item__content__settings__quantity p`);
        
        qtyInput.addEventListener('change', function(){
            input_value = this.value;
            if(input_value > 0 && input_value <= 100){
                qtyLabel.textContent = `Qté : ${input_value}`;
                
                cart[cart_index].quantity = input_value;
                updateLocalStorage(cart);
                updateTotals(cart, articles);
            }
        });
        
        let deleteInput = document.querySelector(`article[data-id="${cart[cart_index].id}"][data-color="${cart[cart_index].color}"] .cart__item__content__settings__delete p`);
        let item_html_article = document.querySelector(`article[data-id="${cart[cart_index].id}"][data-color="${cart[cart_index].color}"]`);
        
        deleteInput.addEventListener('click', function(){
            item_html_article.remove()
            cart.splice(cart_index,1);
            updateLocalStorage(cart);
            updateTotals(cart, articles);
        });
    }
}

//update the total price et quantity of items in the cart
function updateTotals(cart, articles){
    let total_quantity_html_holder = document.getElementById('totalQuantity');
    let total_price_html_holder = document.getElementById('totalPrice');
    let total_quantity = 0;
    let total_price = 0;
    
    for(i=0; i < cart.length; i++){
        const item_index = matchIndex(cart[i].id, articles);
        
        const item_price = articles[item_index].price;
        let item_quantity = parseInt(cart[i].quantity);
        
        total_quantity += item_quantity;
        total_price += item_price * item_quantity;
    }
    str_total_quantity = total_quantity.toLocaleString();
    str_total_price = total_price.toLocaleString();
    
    total_quantity_html_holder.innerHTML = str_total_quantity;
    total_price_html_holder.innerHTML = str_total_price;
}

//update the cart stored in LocalStorage
function updateLocalStorage(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

//given an id, get the index of corresponding item in a list
function matchIndex(id, list){
    const matchId = (element) => element._id == id;
    return list.findIndex(matchId);
}
