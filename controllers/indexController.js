const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

const getProducts = async function (req, res){
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        res.render('shop', { products, success, error, title: "The Place to be" });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'An error occurred while fetching products');
        res.redirect('/');
    }
}

const loginPage = function(req, res) {
    let error = req.flash("error");
    res.render("index", { error, title: "Login/Signup" });
}

const getProduct = async function (req, res) {
    try {
        let randomProducts = await productModel.aggregate([{ $sample: { size: 5 } }]);
        let product = await productModel.findById(req.params.id);
        res.render('show', { randomProducts, product, title: product.name });
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
    
            res.render('cart', { user, success, error, subTotal, totalPrice, title: "Cart" });
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

        res.render('checkout', { user, cart: user.cart, subTotal, totalPrice, title: "CheckOut" });
    } catch (error) {
        console.error('Checkout error:', error); 
        req.flash("error", "An error occurred while processing your request");
        res.redirect("/cart");
    }
}

const orderSuccess = function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    res.render('order-success', { success, error, title: "Order Success" });
}

const ownerLoginPage = function(req, res) {
    let error = req.flash("error");
    res.render("owner-login", { error, title: "Owner Login" });
}

const termsofService = function (req, res) {
    res.render("terms-of-service", { title: "Terms of Service" });
}

const privacyPolicy = function (req, res) {
    res.render("privacy-policy", { title: "Privacy Policy" });
}

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
};