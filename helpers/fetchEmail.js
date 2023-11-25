const Pop3Command = require("node-pop3");

const {
  POP3_CLIENT_PORT,
  POP3_CLIENT_HOST,
  POP3_CLIENT_PASSWORD,
  POP3_CLIENT_USERNAME,
} = process.env;
const pop3 = new Pop3Command({
  user: POP3_CLIENT_USERNAME,
  password: POP3_CLIENT_PASSWORD,
  host: POP3_CLIENT_HOST,
  port: POP3_CLIENT_PORT,
  tls: true,
});

const fetchEmail = async () => {
  const str = await pop3.RETR(2);
  // const str = await pop3.TOP(1250);
  console.log(str);
  // deal with mail string
  // const list = await pop3.UIDL(276);
  // console.dir(list);
  await pop3.QUIT();
};
fetchEmail();
module.exports = fetchEmail;
