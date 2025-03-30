import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts, deleteProduct, createProducts, createMultipleProducts } from "../controllers/productController.js";

const productsRouter = express.Router();

productsRouter.get("/", getAllProducts);
productsRouter.post("/", createProducts)
productsRouter.post("/addMultiple", createMultipleProducts)
productsRouter.delete('/:id', deleteProduct)

// productsRouter.put('/:id', updateProduct)

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default productsRouter;