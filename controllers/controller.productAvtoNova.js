const Product = require("../models/productAvtoNova");
const { v4: uuidv4 } = require("uuid");

const {
  success200,
  notFound404,
  scrapeGoogleSearchResults,
} = require("../helpers");

const product_get = (req, res) => {
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  return res.status(200).send({
    status: "OK",
    message: "Uploading...",
    content: null,
  });
};
const product_getByFabricOrOriginalId = async (req, res) => {
  const { fabrictId } = req.params;
  const data = await Product.find({
    $or: [
      {
        "Каталожный номер производителя": {
          $regex: "^" + fabrictId,
          $options: "ix",
        },
      },
      {
        "Оригинальный номер - Идентификатор": {
          $regex: "^" + fabrictId,
          $options: "ix",
        },
      },
      {
        "Каталожный номер производителя": {
          $regex: fabrictId + "$",
          $options: "ix",
        },
      },
      {
        "Оригинальный номер - Идентификатор": {
          $regex: fabrictId + "$",
          $options: "ix",
        },
      },
    ],
  }).exec();

  if (!data) notFound404(fabrictId);
  success200(res, data);
};
const product_getByGoogle = async (req, res) => {
  const { fabrictId } = req.params;

  const products = await scrapeGoogleSearchResults(fabrictId);
  if (products.length === 0) {
    notFound404(fabrictId);
  }
    const data = products.map((el) => {
      const newObj = { ...el, _id: uuidv4() };
      return newObj;
    });
  success200(res, data);
};

const product_post = (req, res) => {
  const host = process.env.HOST_NAME;
  const filename = req.body.filename.replace(/ +/g, ""); // postman form-data first-field file, second field name of file
  // const filename = req.file.filename; // fallback postman direct take filename from first field of form-data
  if (!req.body) {
    // if (!req.body || !req.file) {
    return res.status(200).send({
      status: "ERR_REQUEST",
      message: "Please check your request!",
      content: null,
    });
  }

  const imageUrl =
    host + "/public/api/static/images/productPictures/" + filename + ".jpg";
  const resizeUrl =
    host +
    "/public/api/static/images/productPictures/" +
    "256x144-" +
    filename +
    ".jpg";

  const product = new Product({
    filename,
    // price: req.body.price,
    // color: req.body.color,
    // origin: req.body.origin,
    // standard: req.body.standard,
    // description: req.body.description,
    // url: imageUrl,
    // thumb: resizeUrl,
    // type: req.body.type,
  });
  return product
    .save()
    .then((data) => {
      return res.status(200).send({
        status: "OK",
        message: "Added Product Successfully",
        content: data,
      });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "ERR_SERVER",
        message: err.message,
        content: null,
      });
    });
};

// eslint-disable-next-line consistent-return
const product_update = async (req, res) => {
  const id = req.params.id;
  const host = process.env.HOST_NAME;
  let filename = "";
  let imageUrl = "";
  let resizeUrl = "";
  if (!req.params.id || !req.body) {
    return res.status(200).send({
      status: "ERR_REQUEST",
      message: "Please check your ID request",
      content: null,
    });
  }
  if (req.file) {
    filename = await req.body.filename.replace(/ +/g, "");
    imageUrl =
      host + "/public/api/static/images/productPictures/" + filename + ".jpg";
    resizeUrl =
      host +
      "/public/api/static/images/productPictures/" +
      "256x144-" +
      filename +
      ".jpg";
  }

  const product = req.file
    ? {
        filename: req.body.filename,
        price: req.body.price,
        color: req.body.color,
        origin: req.body.origin,
        standard: req.body.standard,
        description: req.body.description,
        url: imageUrl,
        thumb: resizeUrl,
        type: req.body.type,
      }
    : req.body;
  console.log(product);
  Product.findByIdAndUpdate(id, product)
    .then((data) => {
      return res.status(200).send({
        status: "OK",
        message: "Updated Product Successfully",
        content: data,
      });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "ERR_SERVER",
        message: err.message,
        content: null,
      });
    });
};

const product_delete = (req, res) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id)
    .then((data) => {
      return res.status(200).send({
        status: "OK",
        message: "Deleted Product Successfully",
        content: data,
      });
    })
    .catch((err) => {
      return res.status(400).send({
        status: "ERR_SERVER",
        message: err.message,
        content: null,
      });
    });
};

module.exports = {
  product_get,
  product_getByFabricOrOriginalId,
  product_getByGoogle,
  product_post,
  product_update,
  product_delete,
};
