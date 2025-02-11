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
  for (let i = 0; i < 3; i++) {
    await scrollPage();
  }
  try {
    await page.waitForSelector(".fG8Fp.uo4vr"); // ensure at least first result awaited
  } catch (error) {
    console.log(error.message);
    return [];
  }
  // Extract prices from the search results
  const prices = await page.evaluate(() => {
    const resultElements = document.querySelectorAll(".MjjYud");
    return Array.from(resultElements, (element) => {
      const siteAddress = element.querySelector(
        // 'a[jsname="UWckNb"]',
        // ".VuuXrf", // main name
        ".qLRx3b.tjvcx.GvPZzd.cHaqb", // full path
        // ".byrV5b", // div on full path to match results 28 to 18 compare to .qLRx3b.tjvcx.GvPZzd.cHaqb
      )?.textContent;
      const priceElement = element.querySelector(".fG8Fp.uo4vr");
      const priceText = priceElement
        ? priceElement?.textContent
        : "Price not available";

      // Use a regular expression to extract the price (assuming it's in the format '162,00 грн')
      // const match = priceText.match(/(\d{1,6}(?:,\d{1,3}))\sгрн/);
      const match = priceText.match(/(\d{1,3}(?:\s\d{3})*(?:,\d{2})?)\sгрн/);

      // If a match is found, use the captured group as the price, otherwise set it to 'Price not available'
      const price = match ? match[1].replace(/\s/g, "") : "Price not available";
      return { siteAddress, price };
    });
  });
  const filteredResults = prices.filter(
    (result) => result.price !== "Price not available",
  );
  const formatedResults = filteredResults.map((el) => ({
    ...el,
    siteAddress: el.siteAddress.replace(/ › /g, "/"),
  }));
  const rmDots = formatedResults.map((el) => {
    // Use the regular expression to match URLs
    const urlMatch = el.siteAddress.match(
      /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+/,
    );
    // console.log(urlMatch);
    // Check if a URL match is found
    if (urlMatch && urlMatch[0]) {
      // Use the first matched URL
      return {
        ...el,
        siteAddress: urlMatch[0],
      };
    } else {
      // If no URL match is found, keep the original siteAddress
      return el;
    }
  });
  const filteredDups = rmDots.filter((value, index, self) => {
    return index === self.findIndex((t) => t.siteAddress === value.siteAddress);
  });
  await browser.close();
  return filteredDups;
}

// Example usage
// scrapeGoogleSearchResults("712550710");
// scrapeGoogleSearchResults("karcher wd 3");
// scrapeGoogleSearchResults("sdfsdfsdfsdfsdffswer");
module.exports = scrapeGoogleSearchResults;
