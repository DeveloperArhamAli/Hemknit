const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number, default: 1 }
        }
    ],
    status: { type: String, default: 'Pending' },
    totalPrice: { type: Number, required: true },
    contactNumber: { type: String, required: true },
    date: { type: Date, default: Date.now },
});


const userSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    password: String,
    contactNumber: String,
    address: String,
    postalCode: String,
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number, default: 0 },
            price: { type: Number, default: 0 }
        }
    ],
    orders: [orderSchema]
});

module.exports = mongoose.model("user", userSchema);