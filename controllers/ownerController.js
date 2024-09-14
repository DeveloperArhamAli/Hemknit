const bcrypt = require("bcrypt")
const ownerModel = require("../models/owner-model");
const userModel = require("../models/user-model");
const productModel = require('../models/product-model');
const categoryModel = require("../models/category-model");

const createOwner = async function (req, res) {
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
}

const adminDashboard = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");

    try {
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


    } catch (error) {
        console.error(error);
    }
}

const getUsersOrders = async function (req, res) {
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
}

const getOrderDetails = async function (req, res) {
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
}

const updateUserOrderStatus = async function (req, res) {
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
}

const createProducts = async function (req, res) {
    let success = req.flash("success")
    let error = req.flash("error")
    let categories = await categoryModel.find()
    res.render("createproducts", { success, error, categories, title: "Create Products" })
}

const getProducts = async function (req, res){
    try {
        let products = await productModel.find();
        let success = req.flash("success");
        let error = req.flash("error");
        res.render('products', { products, success, error, title: "Products" });
    } catch (error) {
        console.error('Error fetching products:', error);
        req.flash('error', 'An error occurred while fetching products');
        res.redirect('/owners/admin');
    }
}

const getProduct = async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        const categories = await categoryModel.find();
        res.render('product', { product, categories, title: product.name });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.redirect('/owners/admin');
    }
}

const createCategory = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    let categories = await categoryModel.find();
    res.render("createcategory", { success, error, categories, title: "Create Category" });
}

const editCategory = async function (req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    let category = await categoryModel.findById(req.params.id);
    res.render("editcategory", { success, error, category, title: "Edit Category" });
}

module.exports = {
    createOwner,
    adminDashboard,
    getUsersOrders,
    getOrderDetails,
    updateUserOrderStatus,
    createProducts,
    getProducts,
    getProduct,
    createCategory,
    editCategory,
}