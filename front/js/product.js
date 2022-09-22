main()

async function main(){
    const article_id = new URL(location.href).searchParams.get("id");

    const article = await getArticle(article_id);
    showArticle(article);

    const addToCartBtn = document.getElementById("addToCart");
    addToCartBtn.addEventListener("click", function(){
        let quantity = getQuantity();
        let color = getColor();
        if (quantity > 0 && quantity <= 100){
            addItemToCart(article_id, quantity, color); 
        }
    });
}

/** 
* Fetch data from api : 1 product.
* @param {string} id - id of the article we want to display on the page
*/
function getArticle(id){
    const url = "http://localhost:3000/api/products/" + id;
    return fetch(url)
        .then(
            function(response){
                return response.json()
            }
        )
        .then(
            function(article_json){
                return article_json;
            }
        )
}

/** 
* Display article on the page.
* @param {object} article - article (dicts)
*/
function showArticle(article){
    let img_html_holder = document.querySelector(".item__img");
    let title_html_holder = document.getElementById('title');
    let price_html_holder = document.getElementById("price");
    let description_html_holder = document.getElementById("description");
    let colors_html_holder = document.getElementById("colors");
    
    const article_img = `<img src="${article.imageUrl}" alt="${article.altTxt}">`;
    const article_title = article.name;
    const article_price = `${article.price}`;
    const article_description = article.description;
    const article_colors = article.colors;
    let article_color_options = "";
    
    for(i=0; i < article_colors.length; i++){
        let color_option = article_colors[i];
        article_color_options += `<option value="${color_option}">${color_option}</option>`;
    }
    
    img_html_holder.innerHTML = article_img;
    title_html_holder.innerHTML = article_title;
    price_html_holder.innerHTML = article_price;
    description_html_holder.innerHTML = article_description;
    colors_html_holder.innerHTML = article_color_options;
}

/** 
* Add item into the user cart.
* @param {string} id - id of the item to add to the cart
* @param {int} quantity - chosen quantity of item to add, between 1 and 100
* @param {string} color - chosen color of the item
*/
function addItemToCart(id, quantity, color){
    let cart_array = [];
    let item_packet = {'id': id, 'quantity': quantity, 'color': color};

    //check if cart is not empty
    if (typeof localStorage.cart !== 'undefined' && localStorage.cart != '[]'){
        cart_array = JSON.parse(localStorage.cart);

        //check if item already exists in cart
        let number_of_items = cart_array.length;
        for(i=0; i < number_of_items; i++){
            if(cart_array[i].id == item_packet.id && cart_array[i].color == item_packet.color){
                //if it does, we just increase the quantity of this item
                let sum_quantity = cart_array[i].quantity + item_packet.quantity;
                if (sum_quantity <= 100){
                    cart_array[i].quantity = sum_quantity;
                }
                else{
                    cart_array[i].quantity = 100;
                }
                break;
            }
            //if we have reached the end of the array without finding the item, we add it to the cart
            if(i == number_of_items-1){
                cart_array.push(item_packet); // [{id:.., qty: .., color: ..},..,{id:.., qty: .., color: ..}]
            }
        }
    }
    //if cart is empty, we add it to the empty cart_array
    else{
        cart_array.push(item_packet); // [{id:.., qty: .., color: ..}] 
    }
    // we store the new cart in LocalStorage
    localStorage.setItem("cart", JSON.stringify(cart_array));
    console.log(localStorage.cart)
}

/** 
* Get quantity of items.
* @return {int} chosen quantity of item
*/
function getQuantity() {
    return parseInt(document.getElementById("quantity").value);
}

/** 
* Get color of items.
* @return {int} chosen color of item
*/
function getColor() {
    return document.getElementById("colors").value;
}

