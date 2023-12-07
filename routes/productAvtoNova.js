const express = require("express");
const router = express.Router();
const { upload, resize } = require("../middlewares/upload");
const productController = require("../controllers/controller.productAvtoNova");
const { fetchEmail } = require("../helpers");

router.get("/", fetchEmail, productController.product_get);
router.get("/:fabrictId", productController.product_getByFabricOrOriginalId);

//post
router.post(
  "/post",
  upload.single("imageUrl"),
  resize,
  productController.product_post,
);

//update
router.patch(
  "/:id",
  upload.single("imageUrl"),
  resize,
  productController.product_update,
);

//delete
router.delete("/:id", productController.product_delete);

module.exports = router;
