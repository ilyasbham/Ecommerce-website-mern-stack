const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures.js");
const cloudinary = require("cloudinary");

// Create Product -- Admin


exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || !req.files.images) {
    return res.status(400).json({ message: "Images are required" });
  }

  let images = Array.isArray(req.files.images)
    ? req.files.images
    : [req.files.images];

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.user.id;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});





// Controller Logic for Getting All Products with Search, Filter, and Pagination

exports.getAllProduct = catchAsyncErrors(async (req, res, next) => {
    const resultPerPage = 8;
    const productsCount = await Product.countDocuments(); // Total unfiltered count
    // 1. Apply Search and Filter
    const apiFeature = new ApiFeatures(Product.find(), req.query)
    

        .search()
        .filter();

    // 2. Count Filtered Products (using a clone to avoid execution conflict)
    // NOTE: If you are using Mongoose v6+, you MUST use .clone()
    let filteredProductsCount = await apiFeature.query.clone().countDocuments();

    // 3. Apply Pagination (limit and skip) to the original query
    apiFeature.pagination(resultPerPage);

    // 4. Final Execution for the Paginated Results
    const products = await apiFeature.query; 

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount, 
    });
});


// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// Get Product Detail
exports.getProductDetail = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});

// Update Product -- Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  // If new images uploaded, delete old and upload new
  if (req.files && req.files.images) {
    // Delete old images
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    let images = [];

    if (Array.isArray(req.files.images)) {
      images = req.files.images;
    } else {
      images = [req.files.images];
    }

    let imagesLinks = [];
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    product,
  });
});






// Delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Delete images from Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  // Delete product from DB
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: `${product.name} deleted successfully`,
  });
});






//create New review or Update the review
exports.createProductReview = catchAsyncErrors(async (req,res,next)  => {

  //Destructure
  const {rating,comment,productId} = req.body;

  const review = {
    user : req.user._id,
    name : req.user.name,
    rating : Number(rating),
    comment,
};

const product = await Product.findById(productId);;

//rev is review yk element
//Check if the user already reviewed this product
const isReviewed = product.reviews.find (
  (rev) => rev.user.toString()===req.user._id.toString()
);

//If user already reviewed → update existing review
if(isReviewed) {
product.reviews.forEach((rev) => {
  if (rev.user.toString() === req.user._id.toString())
  (rev.rating = rating), (rev.comment = comment);
});
}
//Else → add a new review
else {
  product.reviews.push(review);
  product.numOfReviews = product.reviews.length;

}
//4,5,5,2 = 16/4 =4
let avg = 0;
product.reviews.forEach((rev) => {
  avg += rev.rating;
});
product.ratings = avg / product.reviews.length;

await product.save({ validateBeforeSave: false });



res.status(200).json({
  success:true,
})

})

// Get all reviews of a single product
exports.getAllProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});



// Delete Review
exports.deleteProductReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Filter out the review to be deleted
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  // Recalculate average rating
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });


  let ratings = 0;
  if (reviews.length === 0) ratings = 0;
  else
   ratings =  avg / reviews.length;

  const numOfReviews = reviews.length;
  // Update product document
  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});



