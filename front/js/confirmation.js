main()

function main(){
    const order_id = new URL(location.href).searchParams.get("id");
    showOrderId(order_id);
    clearCart();
}
/** 
* Empty the user's cart.
*/
function clearCart(){
    localStorage.setItem("cart", JSON.stringify([]));
}
/** 
* Display the user order id on the page.
* @param {string} order_id - user order id
*/
function showOrderId(order_id){
    document.getElementById('orderId').innerHTML = order_id;
}