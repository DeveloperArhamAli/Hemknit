const jwt = require("jsonwebtoken")
const userModel = require("../models/user-model")

async function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel
        .findOne({ email: decoded.email })
        .select("-password");
        req.user = user;
        next();
    } catch (err) {
        req.flash("error", "You need to login first.");
        res.redirect("/login");
    }
}

async function checkIfLoggedIn(req, res, next) {
    if (req.cookies.token) {
        try {
            let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            let user = await userModel.findOne({ email: decoded.email })
            .select("-password");
            req.user = user;
            return res.redirect("/profile");
        } catch (err) {
            res.redirect("/login");
        }
    } else {
        next();
    }
}

module.exports = { isLoggedIn, checkIfLoggedIn }