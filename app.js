const express = require('express')
const app = express();
const MiddlewareError = require("./middleware/error")
const swaggerDocs = require("./config/swagger");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require("cors");




// Allow requests from frontend
app.use(
  cors({
    origin: ["http://localhost:5173","https://ecommerce-website-frontend-fvay.onrender.com"], // your deployed frontend URL
    credentials: true, // if you use cookies or authorization headers
  })
);


//config

if (process.env.NODE_ENV !== "PRODUCTION"){
require("dotenv").config({ path: "./config/config.env" });
}

//file upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

//cookie parser
//to get token from cookie
app.use(cookieParser());
//using middleware
//json data ko read krne k liye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));



app.set("query parser", "extended");


//importing routes
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');



//using routes
//http://localhost:5000/api/v1/products
app.use('/api/v1',product);
app.use('/api/v1',user);
app.use('/api/v1',order);
app.use('/api/v1',payment);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


//middleware for error 
app.use(MiddlewareError)



module.exports=app;