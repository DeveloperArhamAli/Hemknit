const express = require("express")
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");

const { 
    addToCart,
    increaseProductQuantity,
    decreaseProductQuantity,
    removeFromCart,
    placeOrder,
    orders,
    getOrder,
    cancelOrder,
    profile,
} = require("../controllers/userController")


const { 
    registerUser,
    loginUser,
    logout
} = require("../controllers/authController");


router.post("/register", registerUser);

router.post("/login", loginUser)

router.get("/logout", logout)

router.post('/placeorder', isLoggedIn, placeOrder);

router.get('/my-orders', isLoggedIn, orders)

router.get('/profile', isLoggedIn, profile)

router.get("/addtocart/:productid", isLoggedIn, addToCart);

router.post('/cart/increase/:productid', isLoggedIn, increaseProductQuantity);

router.post('/cart/decrease/:productid', isLoggedIn, decreaseProductQuantity);

router.post('/cart/remove/:productid', isLoggedIn, removeFromCart);

router.post('/cancel-order/:orderId', isLoggedIn, cancelOrder);

router.get('/order/:orderId', isLoggedIn, getOrder);

module.exports = router;