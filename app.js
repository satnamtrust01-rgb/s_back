const express = require("express");
const path = require("path");
const cors = require("cors");
const Joi = require("joi");
const config = require("config");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config(); 

// Routes
const login = require("./router/login");
const registration = require("./router/registration");
const dashboard = require("./router/dashboard")
const userdashboard = require("./router/userdashboard");
const payment = require("./router/payment");




const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

if (!config.get("jwtPrivateKey")) {
  process.exit(1);
}

// ENV variables (keep in .env file)
app.use(cors({ origin: process.env.FRONTEND_URL }));


app.use(logger);
app.use(function (req, res, next) {
  console.log("Authentication");
  next();
});

app.use(
  "/upload/profile",
  express.static(path.join(__dirname, "upload/profile"))
);

app.use("/api/login", login);
app.use("/api/registration", registration);
app.use("/api/dashboard", dashboard)
app.use("/api/userdashboard", userdashboard);
app.use("/api/payment", payment);


//  START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
