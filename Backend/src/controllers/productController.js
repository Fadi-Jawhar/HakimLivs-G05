import Product from "../models/Product.js";
import mongoose from "mongoose";


// GET ALL funktion
export const getAllProducts = async (req, res) => {
    try {
      const products = await Product.find(); 
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// POST funktion
export const createProducts = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE funktion
export const deleteProduct = async(req, res)=>{
  const {id} = req.params
  // Valiterar att id:t är i rätt format innan try/catch
  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({success: false, message: 'Product not found'})
} 
  try {
      const deletedProduct = await Product.findByIdAndDelete(id)
      if(!deletedProduct){
        return res.status(404).json({error: 'Product not found'})
      }
      res.status(200).json({success: true, message: 'Product deleted successfully'})
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, error: "Internal server error" })
    }
}

export const updateProduct = async (req, res)=>{
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
      
    }
}
