const Imap = require("node-imap");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const XLSX = require("xlsx");
const uploadToDB = require("./uploadToDB");
const dropOldProduducts = require("./dropOldProducts");
const simpleParser = require("mailparser").simpleParser;
const UpdateTime = require("../models/updateTimeAvtoNova");
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
  const millisecondsInHour = 20 * 60 * 1000; // 20 * 60 means every 20 min check for email with searchTerm header

  // Set up the interval
  setInterval(fetchEmail, millisecondsInHour);
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
              // msg.on("attributes", async function (attrs) {
              //     const document = new UpdateTime({
              //       updateDate: attrs.date,
              //     });
              //     document.save((err, _) => {
              //       if (err) {
              //         //error for dupes
              //         if (err) throw err;
              //       }
              //     });
              // });
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
                          const extractAndReadExcel = async (
                            attachmentFilePath,
                          ) => {
                            fs.createReadStream(attachmentFilePath)
                              .pipe(unzipper.Parse())
                              .on("entry", async (entry) => {
                                const buffer = await entry.buffer();
                                await dropOldProduducts();

                                if (buffer) {
                                  try {
                                    const workbook = XLSX.read(buffer, {
                                      type: "buffer",
                                      sheetRows: 17500, // If >0, read the first sheetRows rows
                                    });
                                    const sheetName = workbook.SheetNames[0];
                                    const worksheet =
                                      workbook.Sheets[sheetName];
                                    const csvData =
                                      XLSX.utils.sheet_to_csv(worksheet);
                                    await uploadToDB(csvData);
                                  } catch (error) {
                                    console.error(
                                      "Error reading Excel file:",
                                      error.message,
                                    );
                                  }
                                } else {
                                  entry.autodrain();
                                }
                              });
                          };

                          extractAndReadExcel(attachmentFilePath);
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

module.exports = fetchEmail;
