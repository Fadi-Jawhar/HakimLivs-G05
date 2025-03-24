import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { getAllProducts, deleteProduct, createProducts } from "../controllers/productController.js";

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
productsRouter.post("/", createProducts)

// endpoint: api/products/id
productsRouter.delete('/:id', deleteProduct)
// productsRouter.put('/:id', updateProduct)

//TODO Update product (admin only)

//TODO Delete product (admin only)

export default productsRouter;
