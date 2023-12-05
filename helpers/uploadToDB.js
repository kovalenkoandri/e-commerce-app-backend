const csv = require("csv-parser");
const Product = require("../models/productAvtoNova");
const findDuplicates = require("./findDuplicates");
const calculateSpecialPrice = require("./calculateSpecialPrice");
const createHeaderObject = require("./createHeaderObject");
const path = require("path");

let savedDocsCount = 0;
const saveLimit = 3;

const uploadToDB = async () => {
  const filePath = path.join(process.cwd(), "_output.csv");
  Product.collection.drop((err) => {
    if (err) {
      console.error("Error dropping collection:", err);
      return;
    }
  });
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist: ${filePath}`);
      // Handle the case where the file does not exist
    } else {
      // The file exists, so you can run your code here
      console.log(`File exists: ${filePath}`);

      // Assuming 'results' is an array of documents to be inserted
      const readableStream = fs
        .createReadStream("_output.csv")
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
          // if (savedDocsCount < saveLimit) {
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
          // savedDocsCount++;
          // } else {
          //   console.log(`Save limit reached. Not saving more documents.`);
          //   readableStream.destroy(); // Stop reading the stream if limit is reached
          // }
        })
        .on("end", async () => {
          await findDuplicates();
          console.log("CSV file successfully processed");
        });
    }
  });
};

module.exports = uploadToDB;
