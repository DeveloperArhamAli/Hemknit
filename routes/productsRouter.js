const express = require("express")
const router = express.Router();
const upload = require("../config/multer-config")
const isAdmin = require("../middlewares/isAdmin");

const { 
    createProduct, 
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");


router.post("/create", isAdmin , upload.array("images"), createProduct);

router.get('/products', isAdmin, getProducts)

router.get('/products/:id', isAdmin, getProductDetails);

router.post('/products/:productId/edit', isAdmin, updateProduct);

router.post('/product/:id/delete', isAdmin, deleteProduct);

module.exports = router;