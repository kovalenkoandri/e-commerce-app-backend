const success200 = require("./success200");
const notFound404 = require("./notFound404");
const alreadyExists400 = require("./alreadyExists400");
const sendEmail = require("./sendEmail");
const fetchEmail = require("./fetchEmail");
const removeDuplicates = require("./removeDuplicates");
const searchQuery = require("./searchQuery");
const scrapeGoogleSearchResults = require('./scrapeGoogleSearchResults');

module.exports = {
  success200,
  notFound404,
  alreadyExists400,
  sendEmail,
  removeDuplicates,
  fetchEmail,
  searchQuery,
  scrapeGoogleSearchResults,
};
