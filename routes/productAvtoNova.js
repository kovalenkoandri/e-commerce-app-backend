const express = require("express");
const router = express.Router();
const { upload, resize } = require("../middlewares/upload");
const productController = require("../controllers/controller.productAvtoNova");

router.get("/", productController.product_get);
router.get("/:fabrictId", productController.product_getByFabricOrOriginalId);
router.get("/getByGoogle/:fabrictId", productController.product_getByGoogle);

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
