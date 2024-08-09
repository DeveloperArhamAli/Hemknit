const express = require("express")
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");

const { 
    editUserDetails, 
    addToCart,
    increaseProductQuantity,
    decreaseProductQuantity,
    removeFromCart,
    placeOrder,
    getOrder,
    cancelOrder
} = require("../controllers/userController")


const { 
    registerUser,
    loginUser,
    logout
} = require("../controllers/authController");


router.post("/register", registerUser);

router.post("/login", loginUser)

router.get("/logout", logout)

router.post("/:userId/edit", isLoggedIn, editUserDetails)

router.get("/addtocart/:productid", isLoggedIn, addToCart);

router.post('/cart/increase/:productid', isLoggedIn, increaseProductQuantity);

router.post('/cart/decrease/:productid', isLoggedIn, decreaseProductQuantity);

router.post('/cart/remove/:productid', isLoggedIn, removeFromCart);

router.post('/placeorder', isLoggedIn, placeOrder);

router.get('/order/:orderId', isLoggedIn, getOrder);

router.post('/cancel-order/:orderId', isLoggedIn, cancelOrder);

module.exports = router;