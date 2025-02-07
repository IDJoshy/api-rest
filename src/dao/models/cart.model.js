import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema(
{
    products: 
    [
        {
            product: { type: mongoose.Schema.Types.ObjectId, required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
},
{
    timestamps: true,
    //strict: true
}    
);

export const cartModel = mongoose.model(cartCollection, cartSchema);