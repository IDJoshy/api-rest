import { Router } from "express";
import { io } from "../app.js";
import { ProductManager } from "../dao/ProductManager.js";
import { HandlerError } from "../utils.js";


export const router = Router();
//ProductManager.SetPath("./src/data/products.json");

function ValidateValues(inputValidate)
{
    const validFields = ["title", "description", "code", "price", "status", "stock", "category", "thumbnails"];

    const allowedTypes = 
    {
        title: "string",
        description: "string",
        code: "string",
        price: "number",
        status: "boolean",
        stock: "number",
        category: "string",
        thumbnails: "array",
    };

    const invalidFields = Object.keys(inputValidate).filter(field => !validFields.includes(field));

    if (invalidFields.length > 0) 
    {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
    }

    for (const [key, value] of Object.entries(inputValidate)) 
    {
        const expectedType = allowedTypes[key];
        if (expectedType === "array") {
            if (!Array.isArray(value) || !value.every(item => typeof item === "string")) {
                throw new Error(`${key} must be an array of strings`);
            }
        } else if (typeof value !== expectedType) {
            throw new Error (`${key} must be of type ${expectedType}`);
        }
    }
}

//GET PRODUCTS
router.get("/", async (req, res) =>
{
    try
    {
        let { limit = 10, page = 1, sort, query } = req.query;

        limit = parseInt(limit, 10);
        if(isNaN(limit)|| limit <= 0) HandlerError(res, `Bad Request: Invalid limit input: ${limit}`);
        page = parseInt(page, 10);
        if(isNaN(page) || page <= 0) HandlerError(res, `Bad Request: Invalid page input: ${page}`);

        let filter = {};
        if(query) filter = { $or: [{ category: query }, { status: query === "true" }] };
        
        let sorting = {};

        if(sort === "asc") sorting = {price: 1};
        if(sort === "desc") sorting = {price: -1};
    

        const totalProducts = await ProductManager.GetProducts(filter, sorting);
        const totalPages = Math.ceil(totalProducts.length / limit);

        if(page > totalPages && totalPages > 0) return HandlerError(res, `Bad Request: Page ${page} exceeds total pages ${totalPages}`, 400);

        const products = totalProducts.slice((page - 1) * limit, page * limit);

        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;


        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            status: "success",
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&query=${query || ''}` : null,
            nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&query=${query || ''}` : null
        });
    }
    catch(error)
    {
        HandlerError(res, error);
    }
});

//GET PRODUCTS BY ID
router.get("/:pid", async(req, res) =>
{
    try
    {
        const {pid} = req.params;

        if(!pid.match(/^[0-9a-fA-F]{24}$/))
        {
            return res.status(400).json({ error: "Invalid Product ID" });
        }

        const product = await ProductManager.GetProductBy({ _id: pid });

        if(!product)
        {
            return res.status(404).json({error: `Product with _id (${pid}) not found`});
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({product});
    }
    catch(error)
    {
        HandlerError(res, error);
    }

})

//POST ADD-PRODUCTS
router.post("/", async (req, res) =>
{
    try
    {
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
        //Validations
        if(!title || !description || !code || !price || !status || !stock || !category)
        {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: "Invalid input data"});
        }

        ValidateValues(req.body);
        
        const isThereProduct = await ProductManager.GetProductBy({code: code});

        if(isThereProduct) { return res.status(400).json({error: `Product with code: ${code} already exists`}); }
        
        //Add
        let newProduct = await ProductManager.AddProduct({title, description, code, price, status, stock, category, thumbnails});
        //Update
        const products = await ProductManager.GetProducts();
        io.emit("updateProducts", products);

        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({payload: `Product successfully added`, newProduct});

    }catch(error)
    {
        HandlerError(res, error.message);
    }
})
//PUT UPDATE-PRODUCTS
router.put("/:pid", async (req, res) =>
{    
    try
    {

        const { pid } = req.params;
    
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid Product ID" });
        }

        ValidateValues(req.body);

        //Validations
        if(req.body.id) 
        {
            return res.status(400).json({ error: `You can't update the id parameter`});
        }
        
        if(req.body.code)
        {
            if(typeof req.body.code === "string")
            {
                let itsThereProduct = await ProductManager.GetProductBy({code: req.body.code});
                if(itsThereProduct && pid !== itsThereProduct._id)
                {
                    return res.status(400).json({error: `There's already a product with code: ${req.body.code} with id: ${itsThereProduct.id}`});
                }
            }
        }
        
        let modified = await ProductManager.UpdateProduct(pid, req.body);
        if(!modified) {
            return res.status(404).json({ error: `Product with _id ${pid} not found` });
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `Product with id: ${pid} updated with new data`, modified });
        
    }
    catch(error)
    {
        HandlerError(res, error);
    }
})
//DELETE DELETE-PRODUCTS
router.delete("/:pid", async (req, res) =>
{
    try
    {
        const { pid } = req.params;
        if (!pid.match(/^[0-9a-fA-F]{24}$/)) 
        {
            return res.status(400).json({ error: "Invalid Product ID" });
        }

        const productToEliminate = await ProductManager.GetProductBy({ _id: pid });
        if (!productToEliminate) {
            return res.status(404).json({ error: `Not Found: No product with ID ${pid}` });
        }

        let status = await ProductManager.DeleteProduct(pid);
        // Update via socket
        const products = await ProductManager.GetProducts({});
        io.emit("updateProducts", products);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `${status}` });
    }
    catch(error)
    {
        HandlerError(res, error);
    }
})








//#region File-System

/*
//GET PRODUCTS
router.get("/", async (req, res) => 
{
    try
    {
        const { limit } = req.query;
        let products = await ProductManager.GetProducts();

        if(limit)
        {
            const parsedLimit = parseInt(limit, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                products = products.slice(0, parsedLimit);
            }
        }

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({products});
    }
    catch(error)
    {
        HandlerError(res, error);
    }

});
//GET PRODUCTS BY ID
router.get("/:pid", async(req, res) =>
{
    let {pid} = req.params;
    const id = parseInt(pid);

    if(isNaN(id))
    {
        return res.status(400).json({ error: `Bad Request: Invalid ID ${id}`});
    }

    try
    {
        let product = await ProductManager.GetProductById(id);
        if(!product)
        {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({error: `Not Found Product with id: ${id}`});
        }
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({product});
    }
    catch(error)
    {
        HandlerError(res, error);
    }

})
//POST ADD-PRODUCTS
router.post("/", async (req, res) =>
{
    let 
    { 
        title, 
        description, 
        code, 
        price, 
        status = true,
        stock, 
        category, 
        thumbnails 
    } = req.body;

    //Validations
    if(!title || !description || !code || !price || !status || !stock || !category)
    {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({error: "Invalid input data"});
    }

    if(!thumbnails || thumbnails.length === 0)
    {
        thumbnails = ["No image"];
    }

    try
    {
        let validate = ValidateValues(req.body);
        
        const isThereProduct = await ProductManager.GetProductByCode(code);

        if(isThereProduct)
        {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({error: `Product with code: ${code} already exists`});
        }
        
        //Add
        let newProduct = await ProductManager.AddProduct({title, description, code, price, status, stock, category, thumbnails});
        //Update
        const products = await ProductManager.GetProducts();
        io.emit("updateProducts", products);
        
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({payload: `Product successfully added`, newProduct});

    }catch(error)
    {
        HandlerError(res, error);
    }
})
//PUT UPDATE-PRODUCTS
router.put("/:pid", async (req, res) =>
{
    let {pid} = req.params;
    const id = parseInt(pid);

    if(isNaN(id))
    {
        return res.status(400).json({ error: `Bad Request: Invalid ID ${id}`});
    }

    let modifiedProduct = req.body;
    
    try
    {
        //Validations
        if(modifiedProduct.id) 
        {
            return res.status(400).json({ error: `You can't update the id parameter`});
        }

        let validate = ValidateValues(modifiedProduct);
        
        if(modifiedProduct.code)
        {
            if(typeof modifiedProduct.code === "string")
            {
                let itsThereProduct = await ProductManager.GetProductByCode(modifiedProduct.code);
                if(itsThereProduct && id !== itsThereProduct.id)
                {
                    res.setHeader('Content-Type', 'application/json');
                    return res.status(400).json({error: `There's already a product with code: ${modifiedProduct.code} with id: ${itsThereProduct.id}`});
                }
            }
        }
        
        let modified = await ProductManager.UpdateProduct(id, modifiedProduct);
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({payload: `Product with id: ${id} updated with new data`, modified});
    }
    catch(error)
    {
        HandlerError(res, error);
    }
})
//DELETE DELETE-PRODUCTS
router.delete("/:pid", async (req, res) =>
{
    let {pid} = req.params;
    const id = parseInt(pid);

    if(isNaN(id))
    {
        return res.status(400).json({ error: `Bad Request: Invalid ID ${id}`});
    }

    try
    {
        const productToEliminate = await ProductManager.GetProductById(id);
        if (!productToEliminate) {
            return res.status(404).json({ error: `Not Found: No product with ID ${id}` });
        }

        //Delete
        let status = await ProductManager.DeleteProduct(id);
        //Update
        const products = await ProductManager.GetProducts();
        io.emit("updateProducts", products);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({payload: `${status}`});
    
    }
    catch(error)
    {
        HandlerError(res, error);
    }
})
*/

//#endregion

