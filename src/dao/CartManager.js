// only for file-system
// import fs from "fs";
import { HandlerError } from "../utils.js";
import { cartModel } from "./models/cart.model.js";
import { productModel } from "./models/product.model.js";

export class CartManager
{

    static async GetCarts()
    {
        return await cartModel.find();
    }

    static async GetCartById(id) 
    {
        return await cartModel.findById(id);
    }


    static async CreateCart() 
    {
        try 
        {
            const newCart = await cartModel.create({ products: [] });
            return newCart;
        } 
        catch (error) 
        {
            throw new Error("Error creating cart: " + error.message);
        }
    }

    static async AddProductToCart(cid, pid)
    {
        const cart = await this.GetCartById(cid);

        if (!cart) 
        {
            throw new Error(`Error (404): There is no cart with id: ${cid}.`);
        }
        
        const product = await productModel.findById(pid);
        if (!product) 
        {
            throw new Error(`Error (404): There is no product with id: ${pid}.`);
        }
    
        // Buscar si el producto ya existe en el carrito
        const productIndex = cart.products.findIndex(p => p.product.equals(pid));
    
        if (productIndex !== -1) 
        {
            cart.products[productIndex].quantity += 1;
        } 
        else 
        {
            cart.products.push({ product: pid, quantity: 1 });
        }
    
        return await cart.save();
    }


    //#region File-System
    /*
    static #path = "";

    static SetPath(path = "")
    {
        this.#path = path;
    }

    static async GetCarts()
    {
        if (!fs.existsSync(this.#path)) 
        {
            handlerError(404, "File not found");
            return [];
        }

        const data = await fs.promises.readFile(this.#path, "utf-8");
        return JSON.parse(data);
    }

    static async CreateCart() 
    {
        const carts = await this.GetCarts();

        const newCart = 
        {
            id: carts.length ? carts[carts.length - 1].id + 1 : 1,
            products: []
        };

        carts.push(newCart);
        
        await this.#SaveFile(JSON.stringify(carts, null, 4));
        return newCart;
    }

    static async GetCartById(id)
    {
        const carts = await this.GetCarts();
        let products = carts.find(cart => cart.id === id);
        return products;
    }

    static async AddProductToCart(cid, pid)
    {
        const carts = await this.GetCarts();
        const cartIndex = carts.findIndex(cart => cart.id === cid);

        if (cartIndex === -1) {
            throw new Error(`There is no cart with id: ${cid}.`);
        }

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(product => product.product === pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } 
        else 
        {
            cart.products.push({ product: pid, quantity: 1 });
        }
        
        carts[cartIndex] = cart;
        await this.#SaveFile(JSON.stringify(carts, null, 4));
        return cart;
    }

    static async #SaveFile(data = "")
    {
        if(typeof data != "string")
        {
            throw new Error("Data must be string format");
        }
        await fs.promises.writeFile(this.#path, data);
    }
    */
    //#endregion

}