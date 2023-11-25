var Imap = require("node-imap");
var fs = require("fs");
  const moment = require('moment');
const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;

const fetchEmail = async () => {
  var imap = new Imap({
    user: POP3_CLIENT_USERNAME,
    password: POP3_CLIENT_PASSWORD,
    host: POP3_CLIENT_HOST,
    port: POP3_CLIENT_PORT,
    tls: true,
  });
  const yesterday = moment().subtract(1, "days").toDate();
  function openInbox(cb) {
    imap.openBox("INBOX", true, cb);
  }

  imap.once("ready", function () {
    openInbox(function (err, box) {
      if (err) throw err;

      imap.search(["UNSEEN", ["SINCE", yesterday]], function (err, results) {
        if (err) throw err;

        const fetch = imap.fetch(results, { bodies: "" });

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
                console.log(`Downloaded attachment: ${attachment.filename}`);
              });
            });
          });
        });

        fetch.on("end", function () {
          imap.end();
        });
      });
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
