import Product from "../models/Product.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



// Hämta alla produkter
export const getAllProducts = async (req, res) => {
  try {
    //! DONT USE IN PRODUCTION - använder mockdata från JSON-fil
    res.json(productsJSON);
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

// TODO: Lägg till update och delete funktioner