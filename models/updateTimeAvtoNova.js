const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const updateTimeSchemaAvtoNova = new Schema(
  {
    updateDate: {
      type: Date,
    },
  },
  { timestamps: true },
);
const UpdateTime = mongoose.model("updateTime", updateTimeSchemaAvtoNova);

module.exports = UpdateTime;
