const puppeteer = require("puppeteer");

async function scrapeGoogleSearchResults(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate to Google search results page
  await page.goto(`https://www.google.com/search?q=${query}`);

  // Function to scroll the page
  const scrollPage = async () => {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    // Wait for a short time to allow the next set of results to load
    await page.waitForTimeout(1000);
  };

  // Scroll a few times to load more results (adjust the loop count based on your needs)
  for (let i = 0; i < 1; i++) {
    await scrollPage();
  }

  await page.waitForSelector(".fG8Fp.uo4vr"); // ensure at least first result awaited
  // Extract prices from the search results
  const prices = await page.evaluate(() => {
    const resultElements = document.querySelectorAll(".MjjYud");
    return Array.from(resultElements, (element) => {
      const siteAddress = element.querySelector(
        // 'a[jsname="UWckNb"]',
        ".VuuXrf", // main name
        // ".qLRx3b.tjvcx.GvPZzd.cHaqb", // full path
      )?.textContent;
      const priceElement = element.querySelector(".fG8Fp.uo4vr");
      const priceText = priceElement
        ? priceElement?.textContent
        : "Price not available";

      // Use a regular expression to extract the price (assuming it's in the format '162,00 грн')
      const match = priceText.match(/(\d{1,6}(?:,\d{1,3}))\sгрн/);

      // If a match is found, use the captured group as the price, otherwise set it to 'Price not available'
      const price = match ? match[1] : "Price not available";
      return { siteAddress, price };
    });
  });

  console.log("Prices:", prices);
  // Filter out objects with 'Price not available'
  const filteredResults = prices.filter(
    (result) => result.price !== "Price not available",
  );

  console.log("Results:", filteredResults);

  await browser.close();
}

// Example usage
scrapeGoogleSearchResults("712550710");
module.exports = scrapeGoogleSearchResults;
