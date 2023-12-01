const Product = require("../models/productAvtoNova");

const findDuplicates = async () => {
  await Product.find();

  return await Product.aggregate([
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
  ]).exec();
};

module.exports = findDuplicates;
