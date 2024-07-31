const express = require("express")
const router = express.Router();
const { 
    registerUser,
    loginUser,
    logout
} = require("../controllers/authController");
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");

router.post("/register", registerUser );

router.post("/login", loginUser)

router.get("/logout", logout)

router.post("/:userId/edit", isLoggedIn, async function (req, res){
    try {
        let user = await userModel.findOne({ email: req.user.email });
    
        user.fullname = req.body.fullname;
        user.email = req.body.email;
        user.contactNumber = req.body.contactNumber;
        user.address = req.body.address;
    
        await user.save()
    
        req.flash("success", "Profile Updated Successfully")
        res.redirect("/profile");
    } catch (error) {
        req.flash("error", "An error occurred!")
        console.log(error);
        res.redirect("/profile");
    }
})

module.exports = router;