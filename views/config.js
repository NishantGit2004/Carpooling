const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const connect = mongoose.connect("mongodb://localhost:27017/carweb3");

connect.then(() => {
    console.log("Connected to Databse");
}).catch(() => {
    connect.log("Error while connecting to Database");
})

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile_no: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    licenseId: {
        type:String,
    }
});

const client = mongoose.model('clients', customerSchema);

module.exports = client;
