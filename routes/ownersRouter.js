const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt")
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");
const productModel = require('../models/product-model')
const isAdmin = require("../middlewares/isAdmin");
const { ownerLogin } = require("../controllers/authController");

if(process.env.NODE_ENV === "development") {
    router.post("/create", async function (req, res) {
        let owners = await ownerModel.find()
        if(owners.length === 2) {
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
                    res.send(createdOwner)
                }
            })
        })
    })
}

router.get("/admin", isAdmin, async function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");


    const userCount = await userModel.countDocuments();
    const productCount = await productModel.countDocuments();

    const resultofTotalOrders = await userModel.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 
                    { $size: "$orders" }
                }
            }
        }
    
    ]);
    const totalOrders = resultofTotalOrders.length > 0 ? resultofTotalOrders[0].totalOrders : 0;

    const last24Hours = new Date(new Date() - 24 * 60 * 60 * 1000);
    const resultof24hrs = await userModel.aggregate([
        { $unwind: "$orders" },
        { $match: { "orders.date": { $gte: last24Hours } } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 }
            }
        }
    ]);
    const totalOrdersinlast24hrs = resultof24hrs.length > 0 ? resultof24hrs[0].totalOrders : 0;

    const sumTotalPriceOfDeliveredOrders = await userModel.aggregate([
        { $unwind: "$orders" },
        { $match: { "orders.status": "Delivered" } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$orders.totalPrice" }
            }
        }
    ]);
    const totalRevenue = sumTotalPriceOfDeliveredOrders.length > 0 ? sumTotalPriceOfDeliveredOrders[0].totalRevenue : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const revenueInLastWeek = await userModel.aggregate([
        { $unwind: "$orders" },
        {
            $match: {
                "orders.status": "Delivered",
                "orders.date": { $gte: oneWeekAgo }
            }
        },
        {
            $group: {
            _id: null,
            totalRevenueLastWeek: { $sum: "$orders.totalPrice" }
            }
        }
    ]);
    const totalRevenueLastWeek = revenueInLastWeek.length > 0 ? revenueInLastWeek[0].totalRevenueLastWeek : 0;

    let orders = [];
    try {
        let users = await userModel.find({}).populate('orders.products.productId');
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

    } catch (error) {
        console.error('Error fetching orders:', error);
        req.flash('error', 'An error occurred while fetching orders');
        res.redirect('/');
    }

    res.render("admin", { userCount, totalOrders, productCount, totalOrdersinlast24hrs, totalRevenue, totalRevenueLastWeek, orders, success, error, title: "Admin Dashboard" });
})

router.get("/createproducts", isAdmin, function(req, res){
    let success = req.flash("success")
    res.render("createproducts", { success, title: "Create Products" })
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

        res.render('admin-orders', { orders: orders, success, error, title: "Orders" });
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
    res.render('products', { products, success, error, title: "Products" });
})

router.post('/ownerlogin', ownerLogin);

router.get('/products/:id', isAdmin, async function (req, res) {
    let product = await productModel.findById(req.params.id);
    res.render('product', { product, title: product.name });
});

router.post('/products/:productId/edit', isAdmin, async (req, res) => {    try {
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

router.post('/product/:id/delete', isAdmin, async (req, res) => {
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
                        address: user.address,
                        postalCode: user.postalCode,
                        order: order,
                        userId: user._id,
                    };
                }
            });
        });

        res.render('owner-order-details', { orderDetails, success, error, title: "Order" });
    } catch (error) {
        console.error('Error fetching order details:', error);
        req.flash('error', 'An error occurred while fetching order details');
        res.redirect('/owners/orders');
    }
});

module.exports = router;