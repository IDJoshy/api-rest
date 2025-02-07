import { Router } from "express";
export const router = Router();
import { CartManager } from "../dao/CartManager.js";
import { ProductManager } from "../dao/ProductManager.js";
import { HandlerError } from "../utils.js";
import mongoose from "mongoose";

//CartManager.SetPath("./src/data/carts.json");
 
//GET CART WITH POPULATE
router.get("/:cid", async (req, res) =>
{
    try {
        const { cid } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "Invalid cart ID" });
        }

        const cart = await CartManager.GetCartById(cid).populate("products.product");

        if (!cart) {
            return res.status(404).json({ error: `Cart with ID ${cid} not found` });
        }

        res.json({ status: "success", payload: cart });
    } catch (error) {
        HandlerError(res, error.message);
    }
})

// CREATE CART
router.post("/", async (req, res) => 
{
    try 
    {
        const newCart = await CartManager.CreateCart();
        return res.status(201).json({ message: "Cart created successfully", cart: newCart });
    } 
    catch (error) 
    {
        HandlerError(res, error);
    }
});

//ADD PRODUCT TO CART
router.post("/:cid/product/:pid", async (req, res) => 
{
    try 
    {
        const { cid, pid } = req.params;
        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "Invalid cart ID or product ID" });
        }

        const productExists = await ProductManager.GetProductById(pid);
        const cartExists = await CartManager.GetCartById(cid);

        if (!cartExists || !productExists) {
            return res.status(404).json({ error: "Cart or product not found" });
        }

        const updatedCart = await CartManager.AddProductToCart(cid, pid);
        return res.status(200).json({ message: "Product added to cart successfully", cart: updatedCart });
    } 
    catch (error) 
    {
        HandlerError(res, error);
    }
});


// UPDATE PRODUCT QUANTITY IN CART
router.put("/:cid/products/:pid", async (req, res) => {
    try
    {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be a positive integer" });
        }

        const updatedCart = await CartManager.UpdateProductQuantity(cid, pid, quantity);
        res.json({ status: "success", payload: updatedCart });
    } 
    catch (error) 
    {
        HandlerError(res, error.message);
    }
});


// DELETE PRODUCT FROM CART
router.delete("/:cid/products/:pid", async (req, res) => 
{
    try 
    {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).json({ error: "Invalid cart ID or product ID" });
        }

        const updatedCart = await CartManager.RemoveProductFromCart(cid, pid);
        res.json({ status: "success", payload: updatedCart });
    } 
    catch (error) 
    {
        HandlerError(res, error.message);
    }
});

// UPDATE CART WITH NEW ARRAY OF PRODUCTS
router.put("/:cid", async (req, res) => 
{
    try 
    {
        const { cid } = req.params;
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ error: "Products must be an array" });
        }

        const updatedCart = await CartManager.UpdateCart(cid, products);
        res.json({ status: "success", payload: updatedCart });
    } 
    catch (error) 
    {
        HandlerError(res, error.message);
    }
});

// DELETE ALL PRODUCTS FROM CART
router.delete("/:cid", async (req, res) => 
{
    try 
    {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).json({ error: "Invalid cart ID" });
        }

        await CartManager.ClearCart(cid);
        res.json({ status: "success", message: "Cart cleared successfully" });
    } 
    catch (error) 
    {
        HandlerError(res, error.message);
    }
});