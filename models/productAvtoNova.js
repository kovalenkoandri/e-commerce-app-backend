const mongoose = require('mongoose');
const Schema = mongoose.Schema;
collation = {
  'locale': 'ru', //# use rus as the language
  'strength': 2, //# ignore case and diacritics, such as accents
  'caseLevel': false, //# do not distinguish between base characters and case variants
  'caseFirst': 'off' //# do not sort uppercase before lowercase or vice versa
}
const productSchemaAvtoNova = new Schema(
  {
    _id: String,
    "Автомобильный бренд": {
      type: String,
    },
    "Оригинальный номер - Идентификатор": {
      type: String,
    },
    "Каталожный номер производителя": {
      type: String,
    },
    Производитель: {
      type: String,
    },
    Наименование: {
      type: String,
    },
    "Наличие шт": {
      type: String,
    },
    Цена: {
      type: String,
    },
    "Цена спец": {
      type: String,
    },
    "Цена Розница": {
      type: String,
    },
  },
  { timestamps: true, collation: collation },
);
const Product = mongoose.model("product", productSchemaAvtoNova);

module.exports = Product;
