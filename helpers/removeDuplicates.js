const findDuplicates = require("./findDuplicates");
const Product = require("../models/productAvtoNova");

const removeDuplicates = async () => {
  try {
    const duplicates = await findDuplicates();
    duplicates.forEach(async (duplicate) => {
      for (let index = 0; index < duplicate.uniqueIds.length; index += 1) {
        await Product.findOneAndDelete({ _id: duplicate.uniqueIds[index] });
      }
    });

    console.log("Duplicates removed successfully.");
  } catch (error) {
    console.error("Error removing duplicates:", error);
  }
};

module.exports = removeDuplicates;
