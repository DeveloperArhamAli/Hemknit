const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    image: Buffer,
    name: String,
    price: Number,
    description: String,
    discount: {
        type: Number,
        default: 0
    },
    brand: String,
    stock: Number,
    popularity: Number,
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("product", productSchema);