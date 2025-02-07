import { Router } from "express";
import { ProductManager } from "../dao/ProductManager.js";
import { CartManager } from "../dao/CartManager.js";

export const router = Router();

//ProductManager.SetPath("./src/data/products.json");

router.get("/", async (req, res) => 
{
    const products = await ProductManager.GetProducts({});
    res.render("home", { title: "Home", products });
});

router.get("/products", async (req, res) => {
    try 
    {
       
        let { page = 1, limit = 10, sort, query } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        let filter = {};
        if(query) 
        {
            filter = { $or: [{ category: query }, { status: query === "true" }] };
        }
    
        let sorting = {};
        if(sort === "asc") sorting = { price: 1 };
        if(sort === "desc") sorting = { price: -1 };
    
        const allProducts = await ProductManager.GetProducts(filter, sorting);
        const totalProducts = allProducts.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const products = allProducts.slice((page - 1) * limit, page * limit);
    
        res.render("products", {
            title: "Products List",
            products,
            totalPages,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 
            ? `/products?page=${page - 1}&limit=${limit}${sort ? "&sort=" + sort : ""}${query ? "&query=" + query : ""}` 
            : null,
          nextLink: page < totalPages 
            ? `/products?page=${page + 1}&limit=${limit}${sort ? "&sort=" + sort : ""}${query ? "&query=" + query : ""}` 
            : null
        });
    } 
    catch (error) 
    {
        res.status(500).send("Error obtaining products");
    }
});

router.get("/products/:pid", async (req, res) => 
{
    try 
    {
        const { pid } = req.params;
        const product = await ProductManager.GetProductBy({ _id: pid });
        if (!product)
            return res.status(404).render("error", { message: "Product Not Found" });
    
        res.render("productDetail", { title: product.title, product });
    } 
    catch (error) 
    {
        res.status(500).send("Error obtaining product");
    }
});

router.get("/carts/:cid", async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await CartManager.GetCartById(cid);
        if (!cart)
            return res.status(404).render("error", { message: "Cart Not Found" });
    
        res.render("cart", { title: `Cart ${cid}`, cart });
    } catch (error) {
        res.status(500).send("Error obtaining cart");
    }
});

router.get("/realtimeproducts", async (req, res) => 
{
    const products = await ProductManager.GetProducts({});
    res.render("realTimeProducts", { title: "Real-Time Products", products });
});