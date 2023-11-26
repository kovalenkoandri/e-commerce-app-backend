const Imap = require("node-imap");
const fs = require("fs");
const unzipper = require("unzipper");
const path = require("path");
const XLSX = require("xlsx");
const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;
const searchTerm = "Состояние"; // The word to search for in the subject
let latestEmailUID = null;
// let attachmentFilename;
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
                    fs.writeFileSync(attachment.filename, attachment.content);
                    console.log(
                      `Downloaded attachment: ${attachment.filename}`,
                    );
                    const filePath = path.join(process.cwd(), "unzipped");
                    fs.createReadStream(attachment.filename).pipe(
                      unzipper.Extract({ path: filePath }),
                    );
                    const fileRegex = /^Состояние.*\.xlsx$/;

                    // Read the files in the directory
                    const files = fs.readdirSync(filePath);

                    // Filter files based on the regular expression
                    const matchingFiles = files.filter((file) =>
                      fileRegex.test(file),
                    );
                    // Process each matching file
                    matchingFiles.forEach((file) => {
                      const filePathMatch = path.join(filePath, file);

                      // Read the Excel file
                      const workbook = XLSX.readFile(filePathMatch);

                      // Assume the first sheet in the workbook
                      const sheetName = workbook.SheetNames[0];
                      const worksheet = workbook.Sheets[sheetName];

                      // Convert the worksheet to CSV
                      const csvData = XLSX.utils.sheet_to_csv(worksheet);
                      
                      fs.writeFileSync("_output.csv", csvData);

                      console.log(
                        `Conversion complete. CSV data saved to: _output.csv`,
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
