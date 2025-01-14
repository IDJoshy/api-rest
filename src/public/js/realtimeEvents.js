const socket = io();

socket.on("updateProducts", (products) => 
{
    const productList = document.getElementById("productList");

    productList.innerHTML = "";
    
    products.forEach((product) => {
        const li = document.createElement("li");
        li.textContent = `${product.title} - $${product.price}`;
        productList.appendChild(li);
    });
});