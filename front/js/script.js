main()

async function main(){
    const articles =  await getArticles();
    showArticles(articles);
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

// Display articles on the page
function showArticles(articles){
    let articles_html_holder = document.getElementById("items");
    for(i=0; i < articles.length; i++){
        articles_html_holder.innerHTML += `
        <a href="./product.html?id=${articles[i]._id}">
            <article>
                <img src="${articles[i].imageUrl}" alt="${articles[i].altTxt}"/>
                <h3 class="productName">${articles[i].name}</h3>
                <p class="productDescription">${articles[i].description}</p>
            </article>
        </a>`;
    }
}