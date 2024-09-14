const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const categoryModel = require("../models/category-model");

const getProducts = async function (req, res){
    try {
        let success = req.flash("success");
        let error = req.flash("error");
        let products = await productModel.find();
        let categories = await categoryModel.find();
        res.render('shop', { products, success, error, categories, title: "The Place to be" });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'An error occurred while fetching products');
        res.redirect('/');
    }
}

const loginPage = async function(req, res) {
    let error = req.flash("error");
    let categories = await categoryModel.find();
    res.render("index", { error, categories, title: "Login/Signup" });
}

const getProduct = async function (req, res) {
    try {
        let randomProducts = await productModel.aggregate([{ $sample: { size: 5 } }]);
        let product = await productModel.findById(req.params.id);
        let categories = await categoryModel.find();
        res.render('show', { randomProducts, product, categories, title: product.name });
    } catch (error) {
        console.error('Error fetching random products:', error.message);
        res.redirect('/');
    }
}

const cartPage = async function(req, res) {
    try {
        let user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart.productId");

            let success = req.flash("success");
            let error = req.flash("error");
    
            let subTotal = user.cart.reduce((total, item) => total + (item.quantity * (item.productId.price - item.productId.discount)), 0);
    
            let totalPrice = user.cart.reduce((total, item) => total + (item.quantity * (item.productId.price - item.productId.discount) + 250 + 100), 0);
    
            let categories = await categoryModel.find();

            res.render('cart', { user, success, error, subTotal, totalPrice, categories, title: "Cart" });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.redirect('/');
    }
}

const checkoutPage = async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('cart.productId');

        let subTotal = user.cart.reduce((total, item) => total + (item.quantity * (item.productId.price - item.productId.discount)), 0);

        let totalPrice = user.cart.reduce((total, item) => total + (item.quantity * (item.productId.price - item.productId.discount) + 250 + 100), 0);

        let categories = await categoryModel.find();

        res.render('checkout', { user, cart: user.cart, subTotal, totalPrice, categories, title: "CheckOut" });
    } catch (error) {
        console.error('Checkout error:', error); 
        req.flash("error", "An error occurred while processing your request");
        res.redirect("/cart");
    }
}

const orderSuccess = async function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    let categories = await categoryModel.find();
    res.render('order-success', { success, error, categories, title: "Order Success" });
}

const ownerLoginPage = async function(req, res) {
    let error = req.flash("error");
    let categories = await categoryModel.find();
    res.render("owner-login", { error, categories, title: "Owner Login" });
}

const termsofService = async function (req, res) {
    let categories = await categoryModel.find();
    res.render("terms-of-service", { categories ,title: "Terms of Service" });
}

const privacyPolicy = async function (req, res) {
    let categories = await categoryModel.find();
    res.render("privacy-policy", { categories ,title: "Privacy Policy" });
}

const getProductsByCategory = async function (req, res) {
    try {
        let category = await categoryModel.findById(req.params.id);
        let products = await productModel.find();
        let categories = await categoryModel.find();
        res.render('productbycategory', { products, categories, category, title: category.name });
    } catch (error) {
        console.error('Error fetching products by category:', error);
        req.flash('error', 'An error occurred while fetching products');
        res.redirect('/');
    }
}

const getProductsBySubCategory = async (req, res) => {
    try {
        const { subCategory } = req.params;
        const products = await productModel.find({ subCategory: subCategory });
        let categories = await categoryModel.find();
        res.render('productbysubcategory', { products, subCategory, categories, title: subCategory });
    } catch (err) {
        console.error(err.message);
        req.flash('error', 'An error occurred while retrieving the products.');
        res.redirect('/');
    }
};

module.exports = { 
    getProducts,
    loginPage,
    getProduct,
    cartPage,
    checkoutPage,
    orderSuccess,
    ownerLoginPage,
    termsofService,
    privacyPolicy,
    getProductsByCategory,
    getProductsBySubCategory,
};