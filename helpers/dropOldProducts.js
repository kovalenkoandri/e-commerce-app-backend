const mongoose = require("mongoose");

const connectionObject = mongoose.createConnection(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: false,
});

async function dropOldProduducts() {
  await connectionObject
    .dropCollection("products")
    .then((success) => {
      console.log(success);
      console.log(`Previous collection dropped`);
    })
    .catch((err) => console.log(err));
}
module.exports = dropOldProduducts;
