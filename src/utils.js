export const HandlerError = (res, error, statusCode = 500) => 
{
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    res.setHeader("Content-Type", "application/json");
    return res.status(statusCode).json({
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined, 
    });
};
