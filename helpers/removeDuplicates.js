const findDuplicates = require("./findDuplicates");
const Product = require("../models/productAvtoNova");

const removeDuplicates = async () => {
  try {
    const duplicates = await findDuplicates();

    duplicates.forEach(async (duplicate) => {
      const { _id } = duplicate;
      await Product.findByIdAndDelete(_id);
    });

    await findDuplicates();
    console.log("Duplicates removed successfully.");
  } catch (error) {
    console.error("Error removing duplicates:", error);
  }
};

removeDuplicates();

module.exports = removeDuplicates;
