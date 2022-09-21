main()

function main(){
    const order_id = new URL(location.href).searchParams.get("id");
    showOrderId(order_id);
    clearCart();
}

function clearCart(){
    localStorage.setItem("cart", JSON.stringify([]));
}

function showOrderId(order_id){
    document.getElementById('orderId').innerHTML = order_id;
}