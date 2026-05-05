const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxlength: [30, "Name cannot exceed 30 characters"],
        minlength: [4, "Name should have more than 4 characters"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password should be at least 6 characters long"],
        select: false //mongo db mr user shr yin ps ma kya lr ag
    },
    avatar: {
        public_id: {
            type: String,
            
        },
        url: {
            type: String,
            
        }
    },
    role: {
        type: String,
        default: "user"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });

// Encrypting password before saving user
userSchema.pre("save", async function (next) {
    //password hashed ma loke htr yin hashed loke 
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//JWT TOKEN
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};


// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    //enteredPassword=plain password , this.password=hashed password
    //database htl ka password nk compare loke 
    return await bcrypt.compare(enteredPassword, this.password);
};

//generating password reset token
userSchema.methods.getResetPasswordToken = function () {
    
    //generating token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //hashing token before saving to database
    //bcrypt ll use lo ya dl
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};




module.exports = mongoose.model("User", userSchema);
