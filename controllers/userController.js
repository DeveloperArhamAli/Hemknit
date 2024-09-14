const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const categoryModel = require("../models/category-model");
const mongoose = require("mongoose");

const addToCart = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        if (!mongoose.Types.ObjectId.isValid(req.params.productid)) {
            req.flash("error", "Invalid product ID");
            return res.redirect("/");
        }

        const productId = new mongoose.Types.ObjectId(req.params.productid);

        let cartItem = user.cart.find(item => item.productId && item.productId.equals(productId));

        let product = await productModel.findById(req.params.productid);
        
        if (cartItem) {
            req.flash("success", "Item is already in the cart");
        } else {
            user.cart.push({ productId, quantity: 1, price: product.price - product.discount });
            req.flash("success", "Added to cart");
        }

        await user.save();
        res.redirect("/");
    } catch (error) {
        console.log(error);
        req.flash("error", "An error occurred while adding to the cart");
        res.redirect("/");
    }
}

const increaseProductQuantity = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        let cartItem = user.cart.find(item => item.productId.equals(req.params.productid));

        let product = await productModel.findById(req.params.productid);

        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect('/cart');
        }

        if (cartItem) {
            if (cartItem.quantity < product.stock) {
                cartItem.quantity += 1;
                cartItem.price = cartItem.quantity * (product.price - product.discount);
                await user.save();
                req.flash("success", "Quantity increased");
            } else {
                req.flash("error", "Not enough stock available");
            }
        } else {
            req.flash("error", "Product not found in cart");
        }

        res.redirect('/cart');
    } catch (error) {
        req.flash("error", "An error occurred while updating the cart");
        res.redirect("/cart");
    }
}

const decreaseProductQuantity = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let cartItem = user.cart.find(item => item.productId.equals(req.params.productid));

        let product = await productModel.findById(req.params.productid);

        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect('/cart');
        }

        if (cartItem && cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            cartItem.price = cartItem.quantity * (product.price - product.discount); // Update price
            await user.save();
            req.flash("success", "Quantity decreased");
        } else {
            req.flash("error", "Cannot decrease quantity below 1");
        }

        res.redirect('/cart');
    } catch (error) {
        req.flash("error", "An error occurred while updating the cart");
        res.redirect("/cart");
    }
}

const removeFromCart = async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        user.cart = user.cart.filter(item => !item.productId.equals(req.params.productid));

        await user.save();
        req.flash("success", "Removed from cart")
        res.redirect('/cart');
    } catch (error) {
        req.flash("error", "An error occurred while updating the cart");
        res.redirect("/cart");
    }
}

const placeOrder = async function(req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('cart.productId');

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        let totalPrice = user.cart.reduce((total, item) => total + (item.quantity * (item.productId.price - item.productId.discount) + 250 + 100), 0);

        let order = {
            products: user.cart.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
            })),
            postalCode: req.body.postalCode,
            status: 'Pending',
            totalPrice: totalPrice,
            contactNumber: req.body.contactNumber,
        };

        user.orders.unshift(order);

        for (let cartItem of user.cart) {
            let product = await productModel.findById(cartItem.productId._id);
            product.stock -= cartItem.quantity;
            await product.save();
        }

        user.contactNumber = req.body.contactNumber,
        user.address = req.body.address,
        user.postalCode = req.body.postalCode,

        user.cart = []
        await user.save();

        
        req.flash("success", "Order placed successfully!");
        res.redirect("/order-success");
        
    } catch (error) {
        console.error(error);
        req.flash("error", "An error occurred while placing your order");
        res.redirect("/checkout");
    }
}

const orders = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    try {
        let user = await userModel.findById(req.user._id).populate('orders.products.productId');
        let categories = await categoryModel.find();
        res.render('my-orders', { categories ,orders: user.orders, success, error, title: "My Orders" });
    } catch (error) {
        console.error('Error fetching orders:', error.message);
        req.flash('error', 'Error fetching orders');
        res.redirect('/');
    }
}

const getOrder = async function (req, res) {
    try {
        let user = await userModel.findOne({ 'orders._id': req.params.orderId }).populate('orders.products.productId');

        let order = user.orders.id(req.params.orderId);
        let categories = await categoryModel.find();

        if (order) {
            res.render('order-details', { categories ,order, user, title: "Order" });
        } else {
            req.flash('error', 'Order not found');
            res.redirect('/my-orders'); 
        }
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while fetching the order details');
        res.redirect('/my-orders');
    }
}

const cancelOrder = async function (req, res) {
    try {
        const user = await userModel.findOne({ email: req.user.email });
        const order = user.orders.id(req.params.orderId);

        if (order.status === 'Pending') {
            order.status = 'Cancelled';
            await user.save();
            req.flash('success', 'Order cancelled successfully');
        } else {
            req.flash('error', 'Order cannot be cancelled as it has been shipped');
        }

        res.redirect('/users/my-orders');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while cancelling the order');
        res.redirect('/my-orders');
    }
}

const profile = async function (req, res) {
    try {
        let success = req.flash("success");
        let error = req.flash("error");
        const user = await userModel.findOne({ email: req.user.email });
        let categories = await categoryModel.find();
        res.render("profile", { categories ,user, success, error, title: "Profile" })
    } catch (error) {
        console.error("An error occurd while viewing the profile", error.message);
        res.redirect("/");
    }
}

module.exports = { 
    addToCart,
    increaseProductQuantity,
    decreaseProductQuantity,
    removeFromCart,
    placeOrder,
    orders,
    getOrder,
    cancelOrder,
    profile,
};