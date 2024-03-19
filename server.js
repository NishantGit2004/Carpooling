const express = require("express");
const client = require("./views/config.js");
const contractABI = require("./api/ABI.json");
const {Web3} = require("web3");
const path = require("path");

const app = express();
const PORT = 3000;

// Connecting with Smart Contract

const web3 = new Web3("http://127.0.0.1:7545");
contractAddress = "0x17e1B41c753e73a154A1C322a2001Bb6d16Dc1E6";
const contract = new web3.eth.Contract(contractABI, contractAddress);

app.set('view engine', 'ejs');

//Static File
// app.use(express.static(path.join(__dirname,'src')));
app.use(express.static("public"));
app.use(express.static("views"));

// Converting to json

app.use(express.json());

app.use(express.urlencoded({ extended: false }));


//Endpoint

app.get("/", (req, res) => {
    res.status(200).render("home");
});

app.get("/login", (req, res) => {
    res.status(200).render("login");
})

app.post("/process-login", async (req, res) => {
    const data = req.body;
    if (await client.findOne({email: data.email})) {
        res.redirect("/");
    }

    res.status(200).send("User not Exists");
});

app.get("/signup", (req, res) => {
    res.status(200).render("signup");
});

app.post("/process-signup", async (req, res) => {
    const signUpData = req.body;
    const signUpInfo = {
        name: signUpData.name,
        username: signUpData.username,
        email: signUpData.email,
        mobile_no: signUpData.phone,
        password: signUpData.password,
        licenseId: signUpData.license
    };

    try {
        const existingUser = await client.findOne({email: signUpData.email});
        if (existingUser) {
            return res.status(400).send('User Exists');
        }

        const userData = await client.insertMany(signUpInfo);
        res.redirect("/login");
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/get-rides", (req, res) => {
    res.status(200).render("book-ride");
});

app.post("/process-get-rides", async (req, res) => {
    const data = req.body;
    rideArray = [];
    try{
        const rideInfo = await contract.methods.getRides(data.pickup, data.destination).call();
        rideInfo.forEach(element => {
            const {rideId, driver, passengers, pickupLocation, destination, timestamp, completed} = element; 
            id = Number(rideId);
            const rideObj = {
                id, pickupLocation, destination, completed
            } 
            rideArray.push(rideObj);
        });
        res.send(rideArray);
        // res.redirect("/render-rides")
    }catch (e) {
        res.status(500).send("No Rides");
    }
});

app.get("/render-rides", (req, res) => {
    res.render("process-book-ride"); 
})

app.get("/create-ride", (req, res) => {
    res.status(200).render("create-ride");
});

app.post("/process-create-ride", async (req, res) => {
    const rideInfo = req.body;
    console.log(rideInfo);
    try{
        const accounts = await web3.eth.getAccounts();
        // const estimatedGas = await contract.methods.createRide(rideInfo.origin, rideInfo.destination).estimateGas({ from: accounts[0] });
        await contract.methods.createRide(rideInfo.pickup, rideInfo.destination).send(
            {
                from: accounts[0],
                gas: 3000000,
            }
        );
        // alert("Ride Created");
        // res.status(200).sendFile(__dirname + "/src/home.html");
        res.status(200).send("Ride Created");
    }catch(e) {
        res.send("Error in creating ride. Try Again..." + e);
    }
});

// Listen

app.listen(PORT, () => {
    console.log(`Serving is running on Port: ${PORT}`);
});