const express = require("express");
const router = express.Router();
const { isLoggedIn, checkIfLoggedIn } = require("../middlewares/isLoggedIn");
const { 
    getProducts, 
    loginPage, 
    cartPage, 
    checkoutPage, 
    placeOrder,
    orderSuccess,
    ownerLoginPage,
    orders,
    profile,
    getProduct,
    addToCart,
    increaseProductQuantity,
    decreaseProductQuantity,
    removeFromCart,
    cancelOrder,
    getOrder
} = require("../controllers/userController");

router.get("/", getProducts);

router.get('/login', checkIfLoggedIn, loginPage);

router.get('/cart', isLoggedIn, cartPage);

router.get('/checkout', isLoggedIn, checkoutPage);

router.post('/placeorder', isLoggedIn, placeOrder);

router.get('/order-success', isLoggedIn, orderSuccess);

router.get('/owner-login', ownerLoginPage)

router.get('/my-orders', isLoggedIn, orders)

router.get('/profile', isLoggedIn, profile)

router.get('/:id', isLoggedIn, getProduct);

router.get("/addtocart/:productid", isLoggedIn, addToCart);

router.post('/cart/increase/:productid', isLoggedIn, increaseProductQuantity);

router.post('/cart/decrease/:productid', isLoggedIn, decreaseProductQuantity);

router.post('/cart/remove/:productid', isLoggedIn, removeFromCart);

router.post('/cancel-order/:orderId', isLoggedIn, cancelOrder);

router.get('/order/:orderId', isLoggedIn, getOrder);

module.exports = router;