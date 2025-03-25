import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts, getProductById, deleteProduct, createProducts } from "../controllers/productController.js";

const productsRouter = express.Router();

productsRouter.get('/', getAllProducts);
productsRouter.get('/:id', getProductById);
productsRouter.post('/', createProducts)
productsRouter.delete('/:id', deleteProduct)

// productsRouter.put('/:id', updateProduct)

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default productsRouter;