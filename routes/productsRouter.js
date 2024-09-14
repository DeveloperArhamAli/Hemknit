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
    createCategory,
    editCategory,
    deleteCategory,
} = require("../controllers/productController");


router.post("/create", isAdmin , upload.array("images"), createProduct);

router.get('/products', isAdmin, getProducts)

router.post('/createCategory', isAdmin, createCategory);

router.post('/category/:id/edit', isAdmin, editCategory);

router.get('/category/:id/delete', isAdmin, deleteCategory);

router.get('/products/:id', isAdmin, getProductDetails);

router.post('/products/:productId/edit', isAdmin, updateProduct);

router.post('/product/:id/delete', isAdmin, deleteProduct);

module.exports = router;