const userModel = require("../models/user-model")
const bcrypt = require("bcrypt")
const { generateToken } = require("../utils/generateToken");
const ownerModel = require("../models/owner-model");

module.exports.registerUser = async function(req, res){
    try{
        let { email, password, fullname } = req.body;

        let user = await userModel.findOne({ email: email })
        if(user) {
            req.flash("error", "You already have an account, please Login");
            return res.redirect("/login");
        }

        bcrypt.genSalt(10, function (err, salt){
            bcrypt.hash(password, salt, async function (err, hash){
                if(err) return res.send(err.message)
                    else{
                        let user = await userModel.create({
                            email,
                            password: hash,
                            fullname,
                        });
                        let token = generateToken(user);
                        res.cookie("token", token);
                        
                        res.redirect("/");
                    }
                })
            })

    } catch(err) {
        res.send(err.message);
    }
}

module.exports.loginUser = async function(req, res) {
    let {email, password} = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) {
        req.flash("error", "Please create an account");
        return res.redirect("/login");
    }

    bcrypt.compare(password, user.password, function(err, result) {
        if(result){
            let token = generateToken(user);
            res.cookie("token", token);
            res.redirect("/")
        }
        else{
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/login");
        }
    })
}

module.exports.ownerLogin = async function(req, res) {
    let {email, password} = req.body;

    let owner = await ownerModel.findOne({ email: email });
    if (!owner) {
        req.flash("error", "Incorrect Email or Password");
        return res.redirect("/owner-login");
    }

    bcrypt.compare(password, owner.password, function(err, result) {
        if(result){
            let token = generateToken(owner);
            res.cookie("token", token);
            res.redirect("/owners/admin")
        }
        else{
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/owner-login");
        }
    })
}

module.exports.logout = function (req, res) {
    res.cookie("token", "");
    res.redirect("/");
}