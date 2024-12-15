import { Router } from "express";
export const router = Router();
import { CartManager } from "../dao/CartManager.js";
import { HandlerError } from "../utils.js";

CartManager.SetPath("./src/data/carts.json");

//GET CART
router.get("/:cid", async (req, res) =>
{
    let {cid} = req.params;
    let id = parseInt(cid);

    if(isNaN(id))
    {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Bad Request: Invalid ID ${id}`});
    }

    try
    {
        let cart = await CartManager.GetCartById(id);
        if(!cart)
        {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `There is no Cart with id: ${id}`});
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(cart.products);
    }
    catch(error)
    {
        HandlerError(res, error);
    }

})

//CREATE CART
router.post("/", async (req, res) => 
{
    try
    {
        let newCart = await CartManager.CreateCart();
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({ message: "Cart created successfully", cart: newCart });
    }
    catch(error)
    {
        HandlerError(res, error);
    }
});

//ADD PRODUCT TO CART
router.post("/:cid/product/:pid", async (req, res) => 
{
    let {cid, pid} = req.params;
    let cartId = parseInt(cid);
    let productId = parseInt(pid);

    if (isNaN(cartId) || isNaN(productId)) {
        return res.status(400).json({ error: "Invalid cart ID or product ID" });
    }

    try
    {
        const updatedCart = await CartManager.AddProductToCart(cartId, productId);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ message: "Product added to cart successfully", cart: updatedCart });
    }
    catch(error)
    {
        HandlerError(res, error);
    }
});