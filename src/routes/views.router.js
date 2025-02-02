import { Router } from "express";
import { ProductManager } from "../dao/ProductManager.js";

export const router = Router();

ProductManager.SetPath("./src/data/products.json");

router.get("/", async (req, res) => 
{
    const products = await ProductManager.GetProducts();
    res.render("home", { title: "Home", products });
});

router.get("/realtimeproducts", async (req, res) => 
{
    const products = await ProductManager.GetProducts();
    res.render("realTimeProducts", { title: "Real-Time Products", products });
});