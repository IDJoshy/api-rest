import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";

import { router as productRouter } from "./routes/product.router.js";
import { router as cartRouter } from "./routes/cart.router.js";
import { router as viewsRouter } from "./routes/views.router.js";


const PORT = 8080;
const app = express();

const httpServer = createServer(app);
export const io = new Server(httpServer);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve("./src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./src/public")));

//Products
app.use("/api/products", productRouter);
//Carts
app.use("/api/carts", cartRouter);
//Views
app.use("/", viewsRouter);

io.on("connection", (socket) => 
{
    console.log("New Client Connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
})

// Inicializar el servidor
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// const server = app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// app.get("/", (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     return res.status(200).send('ok');
// })
