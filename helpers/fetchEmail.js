const Imap = require("node-imap");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const XLSX = require("xlsx");
const uploadToDB = require("./uploadToDB");
const simpleParser = require("mailparser").simpleParser;

const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;
const searchTerm = "Состояние"; // The word to search for in the subject

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
          let latestEmailUID = null;
          if (results.length > 0) {
            latestEmailUID = Math.max(...results);
          }

          if (latestEmailUID) {
            const fetch = imap.fetch(latestEmailUID, { bodies: "" });

            fetch.on("message", function (msg, seqno) {
              msg.on("body", function (stream, info) {
                const filePath = path.join(process.cwd(), "unzipped");

                // Use a library like 'mailparser' to parse the email and extract attachments
                simpleParser(stream, (err, mail) => {
                  if (err) throw err;
                  mail.attachments.forEach((attachment) => {
                    fs.mkdir(filePath, { recursive: true }, (err) => {
                      if (err) throw err;
                      const attachmentFilePath = path.join(
                        process.cwd(),
                        "unzipped",
                        "readyToParse.zip",
                      );
                      fs.writeFile(
                        attachmentFilePath,
                        attachment.content,
                        {},
                        (err) => {
                          if (err) throw err;
                          console.log(
                            `The ${attachmentFilePath} has been saved!`,
                          );

                          const { PassThrough } = require("stream");

                          // Create a PassThrough stream to capture the data in-memory
                          const inMemoryStream = new PassThrough();

                          // Pipe the contents of the zip file into the in-memory stream
                          fs.createReadStream(attachmentFilePath)
                            .pipe(unzipper.ParseOne())
                            .pipe(inMemoryStream);

                          // Handle the data in-memory
                          let dataBuffer = Buffer.alloc(0); // Initialize an empty buffer
                          inMemoryStream.on("data", (chunk) => {
                            dataBuffer = Buffer.concat([dataBuffer, chunk]);
                          });

                          // Handle the end of the in-memory stream
                          inMemoryStream.on("end", () => {
                            console.log("End of data in-memory.");

                            // Read the Excel file from the in-memory buffer
                            const workbook = XLSX.read(dataBuffer, {
                              type: "buffer",
                            });

                            // Assume the first sheet in the workbook
                            const sheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[sheetName];

                            // Convert the worksheet to CSV
                            const csvData = XLSX.utils.sheet_to_csv(worksheet);

                            // uploadToDB(csvData);
                          });
                        },
                      );
                    });
                  });
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
