// only for file-system
// import fs from "fs";

import { HandlerError } from "../utils.js";
import { productModel } from "./models/product.model.js";

export class ProductManager 
{
    static async GetProducts(filter = {}, sortOption = {})
    {
        return await productModel.find(filter).sort(sortOption).lean();
    }

    static async GetProductBy(filter = {}) //filter = {code: "code"}, {title: "title"}, {_id: "id"}
    {
        return await productModel.findOne(filter);
    }
    static async AddProduct(product)
    {
        return await productModel.create(product);
    }   
    static async UpdateProduct(id, modifiedProduct)
    {
        return await productModel.findByIdAndUpdate(id, modifiedProduct, { new: true }).lean();
    }
    static async DeleteProduct(id)
    {
        return await productModel.findByIdAndDelete(id).lean();
    }

    //#region File-System

    /*
    static #path = "";

    static SetPath(path = "")
    {
        this.#path = path;
    }

    static async GetProducts()
    {
        if(fs.existsSync(this.#path))
        {
            return JSON.parse(await fs.promises.readFile(this.#path, {encoding: "utf-8"}));
        }
        else
        {
            return HandlerError(404, "File not found");
        }
    }

    static async GetProductById(id)
    {
        let products = await this.GetProducts();
        let product = products.find(p=>p.id===id);
        return product;
    }

    static async GetProductByCode(code)
    {
        let products = await this.GetProducts();
        let product = products.find(p=>p.code.toUpperCase()===code.trim());
        return product;
    }

    static async AddProduct(product = {})
    {
        let products = await this.GetProducts();
        let id = 1;
        if(products.length > 0)
        {
            id = products[products.length - 1].id + 1;
        }

        let newProduct =
        {
            id,
            ...product
        }

        products.push(newProduct);
        await this.#SaveFile(JSON.stringify(products, null, 5));
        return newProduct;
    }

    static async UpdateProduct(id, modified = {})
    {
        let products = await this.GetProducts();
        let index = products.findIndex(p=>p.id===id);
        if(index === -1)
        {
            throw new Error("Product not found with id: " + id);
        }

        products[index] = 
        {
            ...products[index], 
            ...modified,
            id
        };

        await this.#SaveFile(JSON.stringify(products, null, 5));
        return products[index];
    }

    static async DeleteProduct(id)
    {
        const products = await this.GetProducts();
        const index = products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`Product not found with ID: ${id}`);
        }
        products.splice(index, 1);
        await this.#SaveFile(JSON.stringify(products, null, 4));
        return `Product with ID: ${id} eliminated`;
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