import express from "express";
import { router as productRouter } from "./routes/product.router.js";
import { router as cartRouter } from "./routes/cart.router.js";

const PORT = 8080;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Products
app.use("/api/products", productRouter);

//Carts
app.use("/api/carts", cartRouter);

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send('ok');
})
