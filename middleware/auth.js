const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

//check if user is authenticated or not

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies;;

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }


    //verifying token
    //JWT_SECRET is in .env file
    //verify with jwt token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id);

    
    next();
});


//handling user roles
//...roles means admin, user
//...rest parameter
//...roles is array
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        //req.user.role is from userModel.js
        //req.user.role is either admin or user
        //admin so yin if skip phit ml next twr ml
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler("You are not authorized to access this resource", 403));
        }
        next();
    };
};