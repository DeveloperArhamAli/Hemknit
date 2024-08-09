const productModel = require("../models/product-model")

const createProduct = async function (req, res) {
    try{ let {name, price, discount, description, brand, stock} = req.body;
    
    let product = await productModel.create({
        image: req.file.buffer,
        name,
        price,
        discount,
        description,
        brand,
        stock,
    });

    req.flash("success", "Product created successfully")
    res.redirect("/owners/createproducts");
}
    catch(err) {
        res.send(err.message)
    }
}

const getProducts = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    try {
        let products = await productModel.find();
        res.render('products', { products, success, error, title: "Products" });
    } catch (error) {
        console.error("Error fetching products", error);
        res.redirect("/");
    }
} 

const getProductDetails = async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        res.render('product', { product, title: product.name });
    } catch (error) {
        console.error("Error while getting product details", error);
        res.redirect("/");
    }
}

const updateProduct = async function (req, res) {
    try {
        let product = await productModel.findById(req.params.productId);

        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/admin/products');
        
        }
        product.name = req.body.name;
        product.brand = req.body.brand;
        product.price = req.body.price;
        product.discount = req.body.discount;
        product.stock = req.body.stock;
        product.description = req.body.description;

        await product.save();

        req.flash('success', 'Product updated successfully');
        res.redirect('/owners/products');

    } catch (error) {
        console.error('Error updating product:', error);
        req.flash('error', 'Error updating product');
        res.redirect('/owners/products');
    }
}

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.id;
        const deletedProduct = await productModel.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        req.flash('success', 'Product deleted successfully');
        res.redirect('/owners/products');
    } catch (error) {
        req.flash('error', 'Error Deleting Product')
        console.log(error);
        res.redirect('/owners/products');
    }
}

module.exports = { 
    createProduct,
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
}