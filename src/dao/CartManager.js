import fs from "fs";
import { HandlerError } from "../utils.js";

export class CartManager
{
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

}