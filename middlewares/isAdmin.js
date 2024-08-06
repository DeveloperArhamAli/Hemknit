// module.exports = (req, res, next) => {
//     if (req.user && req.user.isAdmin) {
//         next(); // Proceed to the next middleware or route handler
//     } else {
//         res.redirect("/owner-login")
//     }
// };

const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owner-model");

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to Login first")
        return res.redirect("/")
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY)
        let owner = await ownerModel
        .findOne({ email: decoded.email })
        .select("-password")
        req.owner = owner;
        if (req.owner && req.owner.isAdmin) {
            next();
        } else {
            req.flash("error", "You are not an Admin")
            res.redirect("/")
        }
    } catch (err) {
        req.flash("error", "You need to login first.")
        res.redirect("/");
        console.log(err);
        
    };
};