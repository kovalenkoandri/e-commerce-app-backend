const Imap = require("node-imap");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const Product = require("../models/productAvtoNova");
const findDuplicates = require("./findDuplicates");
const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;
const searchTerm = "Состояние"; // The word to search for in the subject
let latestEmailUID = null;
let attachmentFilePath = null;
let filePathXLSX = null;
let savedDocsCount = 0;
const saveLimit = 100;
const calculateSpecialPrice = async (row) => {
  const numericPrice = parseFloat(row.replace(",", ""));
  if (numericPrice < 100) {
    return Number(numericPrice * 0.1 + numericPrice).toFixed(2);
  } else {
    return Number(numericPrice * 0.01 + numericPrice).toFixed(2);
  }
};

const fetchEmail = async () => {
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
          // Create a new document and set the _id field to someIdinternal value
          if (savedDocsCount < saveLimit) {
            const document = new Product({
              _id: row["Каталожный номер производителя"],
              "Автомобильный бренд": row["Автомобильный бренд"],
              "Оригинальный номер - Идентификатор":
                row["Оригинальный номер - Идентификатор"],
              "Каталожный номер производителя":
                row["Каталожный номер производителя"],
              Производитель: row["Производитель"],
              Наименование: row["Наименование"],
              "Наличие шт": row["Наличие шт"],
              "Наличие\nЛьвов, шт": row["Наличие\nЛьвов, шт"],
              "Наличие\nЧерновцы, шт": row["Наличие\nЧерновцы, шт"],
              "Наличие\nИвано-Франковск, шт":
                row["Наличие\nИвано-Франковск, шт"],
              "Наличие\nУжгород, шт": row["Наличие\nУжгород, шт"],
              "Наличие\nОдесса, шт": row["Наличие\nОдесса, шт"],
              "Наличие\nКременчуг, шт": row["Наличие\nКременчуг, шт"],
              "Наличие\nПолтава, шт": row["Наличие\nПолтава, шт"],
              "Наличие\nДнепропетровск, шт": row["Наличие\nДнепропетровск, шт"],
              "Наличие\nХарьков, шт": row["Наличие\nХарьков, шт"],
              "Наличие\nТернополь, шт": row["Наличие\nТернополь, шт"],
              "Наличие\nЗапорожье, шт": row["Наличие\nЗапорожье, шт"],
              "Наличие\nБелая Церковь, шт": row["Наличие\nБелая Церковь, шт"],
              "Наличие\nКропивницький, шт": row["Наличие\nКропивницький, шт"],
              "Наличие\nЧеркассыы, шт": row["Наличие\nЧеркассыы, шт"],
              Цена: row["Цена"],
              "Цена спец": await calculateSpecialPrice(row["Цена"]),
              //   Number(
              //   parseFloat(row["Цена"].replace(",", "")) * 0.01 +
              //     parseFloat(row["Цена"].replace(",", "")),
              // ).toFixed(2),
              // "Цена Розница": row["Цена Розница"],
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
              console.log(product);
            });
            savedDocsCount++;
          } else {
            console.log(`Save limit reached. Not saving more documents.`);
            readableStream.destroy(); // Stop reading the stream if limit is reached
          }
        })
        .on("end", async () => {
          //   // Remove the _output.csv file after reading
          //   // fs.unlink("_output.csv", (err) => {
          //   //   if (err) {
          //   //     console.error(`Error removing _output.csv file: ${err}`);
          //   //   } else {
          //   //     console.log("Removed _output.csv file");
          //   //   }
          //   // });
          await findDuplicates();
          console.log("CSV file successfully processed");
        });
    }
  });
};

const fetchEmail1 = async () => {
  const imap = new Imap({
    user: POP3_CLIENT_USERNAME,
    password: POP3_CLIENT_PASSWORD,
    host: POP3_CLIENT_HOST,
    port: POP3_CLIENT_PORT,
    tls: true,
  });
  function openInbox(cb) {
    imap.openBox("INBOX", false, cb); // Set readOnly to false to allow modifications
  }

  imap.once("ready", function () {
    openInbox(function (err, box) {
      if (err) throw err;

      imap.search(
        ["UNSEEN", ["HEADER", "SUBJECT", searchTerm]],
        function (err, results) {
          if (err) throw err;

          // Find the UID of the newest email
          if (results.length > 0) {
            latestEmailUID = Math.max(...results);
          }

          if (latestEmailUID) {
            const fetch = imap.fetch(latestEmailUID, { bodies: "" });

            fetch.on("message", function (msg, seqno) {
              msg.on("body", function (stream, info) {
                // Use a library like 'mailparser' to parse the email and extract attachments
                // Here's a basic example using 'mailparser':
                const simpleParser = require("mailparser").simpleParser;

                simpleParser(stream, (err, mail) => {
                  if (err) throw err;
                  mail.attachments.forEach((attachment) => {
                    attachmentFilePath = attachment.filename;
                    // Download attachments to a file
                    fs.writeFileSync(attachmentFilePath, attachment.content);
                    console.log(`Downloaded attachment: ${attachmentFilePath}`);
                    const filePath = path.join(process.cwd(), "unzipped");
                    fs.createReadStream(attachmentFilePath).pipe(
                      unzipper.Extract({ path: filePath }),
                    );
                    // .on("close", () => {
                    //   // Remove the zipped file after unzipping
                    //   fs.unlink(attachmentFilePath, (err) => {
                    //     if (err) {
                    //       console.error(`Error removing zipped file: ${err}`);
                    //     } else {
                    //       console.log(
                    //         `Removed zipped file: ${attachmentFilePath}`,
                    //       );
                    //     }
                    //   });
                    // });

                    const fileRegex = /^Состояние.*\.xlsx$/;

                    // Read the files in the directory
                    const files = fs.readdirSync(filePath);

                    // Filter files based on the regular expression
                    const matchingFiles = files.filter((file) =>
                      fileRegex.test(file),
                    );
                    // Process each matching file
                    matchingFiles.forEach((file) => {
                      filePathXLSX = path.join(filePath, file);

                      // Read the Excel file
                      const workbook = XLSX.readFile(filePathXLSX);

                      // Assume the first sheet in the workbook
                      const sheetName = workbook.SheetNames[0];
                      const worksheet = workbook.Sheets[sheetName];

                      // Convert the worksheet to CSV
                      const csvData = XLSX.utils.sheet_to_csv(worksheet);

                      fs.writeFileSync("_output.csv", csvData);
                      // fs.unlinkSync(filePathXLSX, (err) => {
                      //   if (err) {
                      //     console.error(`Error removing file: ${err}`);
                      //   } else {
                      //     console.log(`Removed file: ${filePathXLSX}`);
                      //   }
                      // });
                      console.log(
                        `Conversion complete. CSV data saved to: _output.csv`,
                      );
                    });
                  });
                  uploadToDB();
                  // Move the email to the Trash
                  imap.move([latestEmailUID], "[Gmail]/Trash", function (err) {
                    if (err) throw err;
                    console.log("Moved email to Trash");

                    // Expunge the mailbox to permanently remove the deleted email
                    imap.expunge(function (err) {
                      if (err) throw err;
                      console.log("Expunged mailbox");
                      imap.end();
                    });
                  });
                });
              });
            });
          } else {
            console.log("No unread emails with the specified subject found.");
            imap.end();
          }
        },
      );
    });
  });

  imap.once("error", function (err) {
    console.log(err);
  });

  imap.once("end", function () {
    // fs.unlink(attachmentFilePath, (err) => {
    //   if (err) {
    //     console.error(`Error removing zipped file: ${err}`);
    //   } else {
    //     console.log(`Removed zipped file: ${attachmentFilePath}`);
    //   }
    // });
    // fs.unlink(filePathXLSX, (err) => {
    //   if (err) {
    //     console.error(`Error removing file: ${err}`);
    //   } else {
    //     console.log(`Removed file: ${filePathXLSX}`);
    //   }
    // });
    console.log("Connection ended");
  });

  imap.connect();
};

fetchEmail();

const millisecondsIn24Hours = 24 * 60 * 60 * 1000;

// Set up the interval
const fetchEmailInterval = setInterval(fetchEmail, millisecondsIn24Hours);

module.exports = fetchEmailInterval;
