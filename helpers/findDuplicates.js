// const mongoose = require("mongoose");

// Assuming you have a mongoose model named 'Product'
// const Product = mongoose.model("Product");
const Product = require("../models/productAvtoNova");
const findDuplicates = () => {
  const condition = {
    /* Your conditions here */
  };

  // Find documents based on the condition
  Product.find(condition, (err, documents) => {
    if (err) {
      console.error("Error finding documents:", err);
      return;
    }

    // Now you have an array of documents that match your condition
    // Use these documents in the aggregation pipeline
    Product.aggregate([
      {
        $group: {
          _id: "$Оригинальный номер - Идентификатор",

          uniqueIds: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]).exec((aggErr, result) => {
      if (aggErr) {
        console.error("Error in aggregation:", aggErr);
        return;
      }

      // Process the aggregation result
      console.log("Aggregation Result:", result);
    });
  });
};
module.exports = findDuplicates;
