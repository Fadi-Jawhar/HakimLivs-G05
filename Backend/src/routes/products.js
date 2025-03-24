import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts } from "../controllers/productController.js";

const productsRouter = express.Router();

productsRouter.get("/", getAllProducts);

// Create product (admin only)
productsRouter.post("/", adminAuth, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default productsRouter;
