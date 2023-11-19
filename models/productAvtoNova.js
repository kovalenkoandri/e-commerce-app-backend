const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchemaAvtoNova = new Schema(
  {
    'Автомобильный бренд': {
      type: String,
    },
    'Оригинальный номер - Идентификатор': {
      type: String,
    },
    'Каталожный номер производителя': {
      type: String,
    },
    Производитель: {
      type: String,
    },
    Наименование: {
      type: String,
    },
    'Наличие шт': {
      type: String,
    },
    'Наличие\nЛьвов, шт': {
      type: String,
    },
    'Наличие\nЧерновцы, шт': {
      type: String,
    },
    'Наличие\nИвано-Франковск, шт': {
      type: String,
    },
    'Наличие\nУжгород, шт': {
      type: String,
    },
    'Наличие\nОдесса, шт': {
      type: String,
    },
    'Наличие\nКременчуг, шт': {
      type: String,
    },
    'Наличие\nПолтава, шт': {
      type: String,
    },
    'Наличие\nДнепропетровск, шт': {
      type: String,
    },
    'Наличие\nХарьков, шт': {
      type: String,
    },
    'Наличие\nТернополь, шт': {
      type: String,
    },
    'Наличие\nЗапорожье, шт': {
      type: String,
    },
    'Наличие\nБелая Церковь, шт': {
      type: String,
    },
    'Наличие\nКропивницький, шт': {
      type: String,
    },
    'Наличие\nЧеркассыы, шт': {
      type: String,
    },
    Цена: {
      type: String,
    },
    'Цена Розница': {
      type: String,
    },
  },
  { timestamps: true },
);
const Product = mongoose.model('product5', productSchemaAvtoNova);

module.exports = Product;
