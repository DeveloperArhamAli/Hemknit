const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
    name: String,
    subCategory: [{
        type: String,
    }],
});

module.exports = mongoose.model("categories", categorySchema);