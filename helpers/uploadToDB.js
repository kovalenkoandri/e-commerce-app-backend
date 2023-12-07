const csv = require("csv-parser");
const Product = require("../models/productAvtoNova");
const findDuplicates = require("./findDuplicates");
const calculateSpecialPrice = require("./calculateSpecialPrice");
const createHeaderObject = require("./createHeaderObject");
const stream = require("stream");

const uploadToDB = async (csvData) => {
  Product.collection.drop((err) => {
    if (err) {
      console.error("Error dropping collection:", err);
      return;
    }
    console.log(`Previous collection dropped`);
  });
  if (!csvData) {
    console.error(`Data does not exist`);
  } else {
    // The file exists, so you can run your code here
    console.log(`csvData exists`);

    // Create a Readable stream from the CSV data in-memory
    const inMemoryStream = new stream.Readable();
    inMemoryStream._read = () => {}; // Required for the stream to work

    // Push the CSV data into the Readable stream
    inMemoryStream.push(csvData);
    inMemoryStream.push(null); // Signal the end of the stream

    // Process the CSV data from the in-memory stream
    inMemoryStream
      .pipe(
        csv({
          skipLines: 2,
          headers: [
            "Автомобильный бренд",
            "Оригинальный номер - Идентификатор",
            "Каталожный номер производителя",
            "Производитель",
            "Наименование",
            "Наличие шт",
            "Наличие\nЛьвов, шт",
            "Наличие\nЧерновцы, шт",
            "Наличие\nИвано-Франковск, шт",
            "Наличие\nУжгород, шт",
            "Наличие\nОдесса, шт",
            "Наличие\nКременчуг, шт",
            "Наличие\nПолтава, шт",
            "Наличие\nДнепропетровск, шт",
            "Наличие\nХарьков, шт",
            "Наличие\nТернополь, шт",
            "Наличие\nЗапорожье, шт",
            "Наличие\nБелая Церковь, шт",
            "Наличие\nКропивницький, шт",
            "Наличие\nЧеркассыы, шт",
            "Цена",
            "Цена Розница",
          ],
        }),
      )
      .on("data", async (row) => {
        const document = new Product({
          ...createHeaderObject(row),
          "Цена спец": await calculateSpecialPrice(row["Цена"]),
        });

        // Save the document to MongoDB
        document.save(async (err, product) => {
          if (err) {
            //error for dupes
            if (err.code === 11000) {
              console.error("Duplicate blocked! " + err.keyValue._id);
              await Product.deleteMany({
                _id: row["Каталожный номер производителя"],
              });
            }
          }
        });
      })
      .on("end", async () => {
        await findDuplicates();
        console.log("CSV file successfully processed");
      });
  }
};

module.exports = uploadToDB;
