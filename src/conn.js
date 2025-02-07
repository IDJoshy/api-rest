import mongoose from "mongoose"


export const connectToService = async (url, dbName) =>
{
    try
    {
        await mongoose.connect(url, {dbName: dbName});
        console.log("Connected to Cluster");
    }
    catch(error)
    {
        console.log(`Error connecting to MongoDB Atlas Cluster: ${error.message}`);
        process.exit();
    }
}