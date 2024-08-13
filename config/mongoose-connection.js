const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

const uri = `${config.get("MONGODB_URI")}/${config.get("DB_NAME")}`;

mongoose.connect(uri)
    .then(function() {
    dbgr("connected");
})
    .catch(function(err) {
    dbgr(err);
});

module.exports = mongoose.connection;
