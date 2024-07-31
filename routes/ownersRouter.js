const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");
const productModel = require('../models/product-model')
const isAdmin = require("../middlewares/isAdmin");
const { ownerLogin } = require("../controllers/authController");
const upload = require("../config/multer-config")

if(process.env.NODE_ENV === "development") {
    router.post("/create", async function (req, res) {
        let owners = await ownerModel.find()
        if(owners.length > 0) {
            return res
            .status(500)
            .send("You dont have permissions to create a new owner")
        }

        let { fullname, email, password, isAdmin } = req.body;

        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if(err) return res.send(err.message)
                    else { let createdOwner = await ownerModel.create({
                        fullname,
                        email,
                        password: hash,
                        isAdmin,
                    })
                    res.status(201).send(createdOwner);
                }
            })
        })
    })
}

router.get("/admin", isAdmin, function(req, res){
    let success = req.flash("success")
    res.render("createproducts", { success, loggedin: false })
});

router.get('/orders', isAdmin, async (req, res) => {
    let success = req.flash("success");
    let error = req.flash("error");
    try {
        let users = await userModel.find({}).populate('orders.products.productId');
        
        let orders = [];
        users.forEach(user => {
            user.orders.forEach(order => {
                orders.push({
                    user: user.fullname,
                    email: user.email,
                    order: order,
                    userId: user._id,
                });
            });
        });

        orders.sort((a, b) => b.order.date - a.order.date);

        res.render('admin-orders', { orders: orders, success, error, loggedin: false });
    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'An error occurred while fetching orders');
        res.redirect('/');
    }
});

router.get('/products', isAdmin, async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    let products = await productModel.find();
    res.render('products', { products, success, error, loggedin: false });
})

router.post('/ownerlogin', ownerLogin);

router.get('/products/:id', isAdmin, async function (req, res) {
    let product = await productModel.findById(req.params.id);
    res.render('product', { product, loggedin: false });
});

router.post('/products/:productId/edit', isAdmin,  upload.single("image"), async (req, res) => {    try {
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
});

router.post('/orders/:userId/:orderId/status', isAdmin, async (req, res) => {
    try {
        let user = await userModel.findById(req.params.userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/orders');
        }

        let order = user.orders.id(req.params.orderId);
        if (!order) {
            req.flash('error', 'Order not found');
            return res.redirect('/admin/orders');
        }

        order.status = req.body.status;
        await user.save();
        
        req.flash('success', 'Order status updated successfully');
        res.redirect('/owners/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        req.flash('error', 'Error updating order status');
        res.redirect('/owners/orders');
    }
});

router.get('/orders/:orderId', isAdmin, async (req, res) => {
    let success = req.flash("success");
    let error = req.flash("error");
    try {
        let users = await userModel.find({'orders._id': req.params.orderId}).populate('orders.products.productId');
        
        if (users.length === 0) {
            req.flash('error', 'Order not found');
            return res.redirect('/owners/orders');
        }

        let orderDetails;
        users.forEach(user => {
            user.orders.forEach(order => {
                if (order._id.toString() === req.params.orderId) {
                    orderDetails = {
                        user: user.fullname,
                        email: user.email,
                        order: order,
                        userId: user._id,
                    };
                }
            });
        });

        res.render('owner-order-details', { orderDetails, success, error, loggedin: false });
    } catch (error) {
        console.error('Error fetching order details:', error);
        req.flash('error', 'An error occurred while fetching order details');
        res.redirect('/owners/orders');
    }
});

module.exports = router;