import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts, deleteProduct, createProducts, updateProduct } from "../controllers/productController.js";

const productsRouter = express.Router();

productsRouter.get("/", getAllProducts);

// Create product (admin only)
productsRouter.post("/", createProducts)

productsRouter.delete('/:id', deleteProduct)

productsRouter.put('/:id', updateProduct)


export default productsRouter;