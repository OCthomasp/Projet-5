main()

async function main(){
    let cart = [];
    let contact = {};
    if (typeof localStorage.cart !== 'undefined' && localStorage.cart != '[]'){
        let cart = JSON.parse(localStorage.cart);
        const articles =  await getArticles();
        showCartArticles(cart, articles);
        addItemEvents(cart, articles);
        updateTotals(cart, articles);
    }
    else{
        updateTotals(cart, undefined);
    }
    //form
    if (typeof localStorage.contact !== 'undefined'){
        let contact = JSON.parse(localStorage.contact);
        document.querySelector("#firstName").value = contact.firstName;
        document.querySelector("#lastName").value = contact.lastName;
        document.querySelector("#address").value = contact.address;
        document.querySelector("#city").value = contact.city;
        document.querySelector("#email").value = contact.email;
    }
    
    const btnValidate = document.querySelector("#order");
    btnValidate.addEventListener("click", async function(e){
        e.preventDefault();

        if (checkFormValidity()){
            if ((typeof localStorage.cart == 'undefined' || localStorage.cart == '[]')){
                alert("Le panier est vide, ajoutez des articles pour passer une commande")
            }
            else{
                contact = JSON.parse(localStorage.contact);
                cart = JSON.parse(localStorage.cart);
                
                const order_id = await postData(contact, cart);
                console.log(order_id);
                if (order_id !== 'undefined') {
                    location.href = "confirmation.html?id=" + order_id;
                }
                else{
                    alert("Une erreur est survenue, la commande n'a pas pu être passée");
                }
            }
        }
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
function addItemEvents(cart, articles){
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

//update the total price and quantity of items in the cart
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

/* ------- FORM ------- */

function checkFormValidity(){
    let contact = {
        firstName: document.querySelector("#firstName").value,
        lastName: document.querySelector("#lastName").value,
        address: document.querySelector("#address").value,
        city: document.querySelector("#city").value,
        email: document.querySelector("#email").value,
    };

    let valid_entry = {
        firstName: firstNameManage(contact.firstName),
        lastName: lastNameManage(contact.lastName),
        address: addressManage(contact.address),
        city: cityManage(contact.city),
        email: emailManage(contact.email)
    }

    // check if any field is incorrect
    if (!(Object.values(valid_entry).includes(false))){
        console.log(contact);
        localStorage.setItem("contact", JSON.stringify(contact));
        return true;
    } 
    else {
        return false;
    }
}

// check if first name or city is valid
function isValidFirstNameCity(str){
    return /^[A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜ][' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-]+$/.test(str);
    // ^ : anchor, begining of the text
    // [A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜ] : (first) character must be an uppercase letter
    // [' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-] : character can be any letter, with "-", "'" and " " included
    // + : quantifier, 1 or more
    // $ : anchor, end of the text
}

// check if last name is valid
function isValidLastName(str){
    return /^[A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü][' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-]+$/.test(str);
    // ^ : anchor, begining of the text
    // [A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü] : (first) character can be any letter
    // [' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-] : character can be any letter, with "-", "'" and " " included
    // + : quantifier, 1 or more
    // $ : anchor, end of the text
}

// check if address is valid
function isValidAddress(str){
    return /^[0-9]{0,4}(bis|ter|quater)? [' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-]+$/.test(str);
    // ^ : anchor, begining of the text
    // [0-9] : match any digit
    // {0,4} : quantifier, any amount between 0 and 4
    // (bis|ter|quater) : match either bis, ter or quater
    // ? : quantifier, 0 or 1
    // // [' A-ZÀÂÄÇÉÈÊËÎÏÔÙÛÜa-zàâäçéèêëîïôùûü\-] : character can be any letter, with "-", "'" and " " included
    // + : quantifier, 1 or more
    // $ : anchor, end of the text
}

// check if email address is valid
function isValidEmail(str){
    return /^[a-z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-z0-9\-]+\.[a-z]{2,3}$/.test(str);
    // ^ : anchor, begining of the text
    // [a-z0-9.!#$%&'*+-/=?^_`{|}~] : match all characters allowed in the local part
    // + : quantifier, 1 or more
    // [a-z0-9\-] : match all characters allowed in the domain name
    // + : quantifier, 1 or more
    // \.[a-z]{2,3} : matches domain extension pattern : "." followed by 2 or 3 letters
    // $ : anchor, end of the text
    //formating reference : https://en.wikipedia.org/wiki/Email_address#Local-part
}

// Manage first name form field
function firstNameManage(first_name) {
    let input_first_name = document.querySelector("#firstName");
    let error_html_holder = document.querySelector("#firstNameErrorMsg");
    if (isValidFirstNameCity(first_name)) {
        input_first_name.style.border = "solid";
        input_first_name.style.borderColor = "green";
        error_html_holder.textContent = "";
        return true;
    } 
    else {
        input_first_name.style.border = "solid";
        input_first_name.style.borderColor = "red";
        error_html_holder.textContent = "Veuillez entrer un prénom valide, ex: Thierry";
        return false;
    }
}
// Manage last name form field
function lastNameManage(last_name) {
    let input_last_name = document.querySelector("#lastName");
    let error_html_holder = document.querySelector("#lastNameErrorMsg");
    if (isValidFirstNameCity(last_name)) {
        input_last_name.style.border = "solid";
        input_last_name.style.borderColor = "green";
        error_html_holder.textContent = "";
        return true;
    } 
    else {
        input_last_name.style.border = "solid";
        input_last_name.style.borderColor = "red";
        error_html_holder.textContent = "Veuillez entrer un nom valide, ex: Henry";
        return false;
    }
}
// Manage address form field
function addressManage(address) {
    let input_address = document.querySelector("#address");
    let error_html_holder = document.querySelector("#addressErrorMsg");
    if (isValidAddress(address)) {
        input_address.style.border = "solid";
        input_address.style.borderColor = "green";
        error_html_holder.textContent = "";
        return true;
    } 
    else {
        input_address.style.border = "solid";
        input_address.style.borderColor = "red";
        error_html_holder.textContent = "Veuillez entrer une adresse valide, ex: 20 rue Lamartine";
        return false;
    }
}
// Manage city form field
function cityManage(city) {
    let input_city = document.querySelector("#city");
    let error_html_holder = document.querySelector("#cityErrorMsg");
    if (isValidFirstNameCity(city)) {
        input_city.style.border = "solid";
        input_city.style.borderColor = "green";
        error_html_holder.textContent = "";
        return true;
    } 
    else {
        input_city.style.border = "solid";
        input_city.style.borderColor = "red";
        error_html_holder.textContent = "Veuillez entrer une ville valide, ex: Lyon";
        return false;
    }
}
// Manage email form field
function emailManage(email) {
    let input_email = document.querySelector("#email");
    let error_html_holder = document.querySelector("#emailErrorMsg");
    if (isValidEmail(email)) {
        input_email.style.border = "solid";
        input_email.style.borderColor = "green";
        error_html_holder.textContent = "";
        return true;
    } 
    else {
        input_email.style.border = "solid";
        input_email.style.borderColor = "red";
        error_html_holder.textContent = "Veuillez entrer un email valide, ex: exemple@exemple.fr";
        return false;
    }
}

/* ------- POST ------- */

async function postData(contact, cart){
    const products = [];
    for (i=0; i<cart.length; i++){
        products.push(cart[i].id);
    }
    const post_body = JSON.stringify({contact, products})

    let post_options = {
        method: "POST",
        body: post_body,
        headers: {
          "Content-Type": "application/json",
        }
    }
    console.log(post_body);
    const url = "http://localhost:3000/api/products/order";
    return fetch(url, post_options)
        .then(
            function(response){
                return response.json();
            }
        )
        .then(
            function(response){
                return response.orderId;
            }
        );
}