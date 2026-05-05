const express = require("express");
const {
  createProduct,
  getAllProduct,
  getAdminProducts,
  getProductDetail,
  updateProduct,
  deleteProduct,
  createProductReview,
  getAllProductReviews,
  deleteProductReview,
} = require("../controllers/productController");
const {isAuthenticatedUser,authorizeRoles}= require("../middleware/auth")


const router = express.Router();

router
  .route("/admin/product/new")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    createProduct // **fileUpload() is already applied globally**
  );

 

router
  .route("/admin/products/:id")

  .put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)

  .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);

  router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

router.route("/products").get(getAllProduct);

router.route("/product/:id").get(getProductDetail);

router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getAllProductReviews).delete(isAuthenticatedUser,deleteProductReview);



module.exports = router;