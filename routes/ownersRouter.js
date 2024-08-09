const express = require("express")
const router = express.Router();
const isAdmin = require("../middlewares/isAdmin");
const { ownerLogin } = require("../controllers/authController");

const { 
    createOwner,
    adminDashboard,
    getUsersOrders,
    getOrderDetails,
    updateUserOrderStatus,
    createProducts,
} = require("../controllers/ownerController");


if(process.env.NODE_ENV === "development") {
    router.post("/create", createOwner)
}

router.post('/ownerlogin', ownerLogin);

router.get("/admin", isAdmin, adminDashboard)

router.get('/orders', isAdmin, getUsersOrders);

router.get('/orders/:orderId', isAdmin, getOrderDetails);

router.post('/orders/:userId/:orderId/status', isAdmin, updateUserOrderStatus);

router.get("/createproducts", isAdmin, createProducts);

module.exports = router;