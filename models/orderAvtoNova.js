const mongoose = require("mongoose");
const Schema = mongoose.Schema;
collation = {
  locale: ["ru", "en"], //# use rus as the language
  strength: 2, //# ignore case and diacritics, such as accents
  caseLevel: false, //# do not distinguish between base characters and case variants
  caseFirst: "off", //# do not sort uppercase before lowercase or vice versa
};
const orderSchema = new Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    product: {},
  },
  {
    timestamps: true,
    collation: collation,
  },
);

const OrderAvtoNova = mongoose.model("order", orderSchema);

module.exports = OrderAvtoNova;
