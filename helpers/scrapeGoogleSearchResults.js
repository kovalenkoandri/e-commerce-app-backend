const puppeteer = require("puppeteer");

async function scrapeGoogleSearchResults(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate to Google search results page
  await page.goto(`https://www.google.com/search?q=${query}`);

  await page.waitForSelector(".fG8Fp.uo4vr"); // ensure at least first result awaited
  // Extract prices from the search results
  const prices = await page.evaluate(() => {
    const resultElements = document.querySelectorAll(".MjjYud");
    return Array.from(resultElements, (element) => {
      const siteAddress = element.querySelector(
        // 'a[jsname="UWckNb"]',
        ".VuuXrf", // main name
        // ".qLRx3b.tjvcx.GvPZzd.cHaqb", // full path
      ).textContent;
      const priceElement = element.querySelector(".fG8Fp.uo4vr");
      const price = priceElement
        ? priceElement.textContent
        : "Price not available";
      return { siteAddress, price };
    });
  });

  console.log("Prices:", prices);

  await browser.close();
}

// Example usage
scrapeGoogleSearchResults("712550710");
module.exports = scrapeGoogleSearchResults;
