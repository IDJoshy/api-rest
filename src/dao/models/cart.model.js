import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema(
{
    products: 
    [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "products", required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ]
},
{
    timestamps: true,
    //strict: true
}    
);

cartSchema.pre("find", function()
{
    this.populate("products.product");
})

cartSchema.pre("findOne", function () 
{
    this.populate("products.product");
});

export const cartModel = mongoose.model(cartCollection, cartSchema);