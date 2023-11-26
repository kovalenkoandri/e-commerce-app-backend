const Imap = require("node-imap");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const Product = require("../models/productAvtoNova");
const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;
const searchTerm = "Состояние"; // The word to search for in the subject
let latestEmailUID = null;
const uploadToDB = () => {
  const filePath = path.join(process.cwd(), "_output.csv"); // Replace 'example.txt' with your actual file name

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File does not exist: ${filePath}`);
      // Handle the case where the file does not exist
    } else {
      // The file exists, so you can run your code here
      console.log(`File exists: ${filePath}`);

      const results = [];

      // Assuming 'results' is an array of documents to be inserted
      // .on("data", (data) => results.push(data))
      fs.createReadStream("_output.csv")
        .pipe(
          csv([
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
          ]),
        )
        .on("data", (data) => results.push(data))
        .on("end", () => {
          // Save the data to the MongoDB database
          Product.insertMany(results, {
            ordered: false,
            lean: false,
          });
          // .then((docs) => {
          // console.log("Data saved to MongoDB:", docs);

          // Remove the _output.csv file after reading
          // fs.unlink("_output.csv", (err) => {
          //   if (err) {
          //     console.error(`Error removing _output.csv file: ${err}`);
          //   } else {
          //     console.log("Removed _output.csv file");
          //   }
          // });
          // })
          // .catch((err) => {
          // console.error("Error saving data to MongoDB:", err);
          // });
          // Product.updateMany(results);
        });
    }
  });
};

const fetchEmail = async () => {
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
                    // Download attachments to a file
                    const attachmentFilePath = attachment.filename;
                    fs.writeFileSync(attachment.filename, attachment.content);
                    console.log(
                      `Downloaded attachment: ${attachment.filename}`,
                    );
                    const filePath = path.join(process.cwd(), "unzipped");
                    fs.createReadStream(attachment.filename).pipe(
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
                      const filePathXLSX = path.join(filePath, file);

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
    console.log("Connection ended");
  });

  imap.connect();
};

fetchEmail();
const millisecondsIn24Hours = 24 * 60 * 60 * 1000;

// Set up the interval
const fetchEmailInterval = setInterval(fetchEmail, millisecondsIn24Hours);

module.exports = fetchEmailInterval;
