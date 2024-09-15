const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    image: [{
        type: Buffer,
    }],
    name: String,
    price: Number,
    description: String,
    discount: {
        type: Number,
        default: 0
    },
    brand: String,
    stock: Number,
    size: [{
        type: String,
    }],
    color: [{
        type: String,
    }],
    category: String,
    subCategory: [{
        type: String,
    }],
});

module.exports = mongoose.model("product", productSchema);