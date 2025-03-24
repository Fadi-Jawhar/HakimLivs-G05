import Product from "../models/Product.js";
import mongoose from "mongoose";


// Hämta alla produkter
export const getAllProducts = async (req, res) => {
    try {
      const products = await Product.find(); 
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const createProducts = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const deleteProduct = async(req, res)=>{
  const {id} = req.params
  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({sucess: false, message: 'Product not found'})
} 
  try {
      const deletedProduct = await Product.findOneAndDelete(id)
      if(!deletedProduct){
        console.log('Product not found')
        return res.status(500).json({error: 'Product not found'})
      }
      res.status(200).json({message: 'Product deleted successfully', deletedProduct})
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "Internal server error" })
    }
}


// TODO: Lägg till update och delete funktioner