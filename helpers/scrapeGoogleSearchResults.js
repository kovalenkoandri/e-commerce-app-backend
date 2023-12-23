const puppeteer = require("puppeteer");

async function scrapeGoogleSearchResults(query) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Navigate to Google search results page
  await page.goto(`https://www.google.com/search?q=${query}`);

  
  // Extract prices from the search results
  const prices = await page.evaluate(() => {
    const priceElements = document.querySelectorAll(".fG8Fp.uo4vr");
    return Array.from(priceElements, (element) => element.textContent);
  });

  console.log("Prices:", prices);

  await browser.close();
}

// Example usage
scrapeGoogleSearchResults("712550710");
module.exports = scrapeGoogleSearchResults;

// find first applicable
  // const priceSelector = await page.waitForSelector(
  //   ".fG8Fp.uo4vr",
  //   // "#rso > div:nth-child(2) > div > div > div:nth-child(4) > div > span",
  // );

  // const prices = await priceSelector?.evaluate((el) => el.textContent);