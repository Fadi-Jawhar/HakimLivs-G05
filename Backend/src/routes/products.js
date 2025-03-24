import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts, deleteProduct, createProducts } from "../controllers/productController.js";

const productsRouter = express.Router();

productsRouter.get("/", getAllProducts);

// Create product (admin only)
productsRouter.post("/", createProducts)

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default productsRouter;