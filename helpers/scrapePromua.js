const puppeteer = require("puppeteer");

async function scrapePromua(query) {
  const browser = await puppeteer.launch({ headless: "new" });
  // const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // await page.setViewport({
  //   width: 3640,
  //   height: 1480,
  //   deviceScaleFactor: 1,
  // });
  await page.goto(`https://prom.ua`);
  const inputSelector = ".Dm7py";
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, query);
  await page.waitForSelector(".VS-Ex.awgzd.gFDME"); // popup with app mobile vers
  await page.click(".VS-Ex.awgzd.gFDME");
  const btnSearchSelector =
    // button["data-qaid='search_btn'"];
    ".VS-Ex.yNx5B.YY-wN.vtaL-.gPzcS._4msv1.blBdq.DuQPf.uBuiQ.Ly27e";
  // ".VS-Ex.yNx5B.YY-wN.vtaL-.gPzcS._4msv1.blBdq.aUEOj._3-Fnr.Ly27e";
  await page.waitForSelector(btnSearchSelector);
  await page.click(btnSearchSelector);
  await page.waitForSelector('div[data-qaid="product_price"]');
  const prices = await page.evaluate(() => {
    const resultElements = document.querySelectorAll("div[data-position-qaid]");
    // const resultElements = document.querySelectorAll("div[data-qaid='product_block']");
    console.log(resultElements);
    return Array.from(resultElements, (element) => {
      const siteAddress = element.querySelector(
        ".l-GwW.fvQVX>._0cNvO.jwtUM>._3Trjq.aXB7S", // main name
      )?.textContent;
      const priceElement = element.querySelector("div[data-qaprice]");

      console.log(priceElement);
      const priceText = priceElement
        ? priceElement?.textContent
        : "Price not available";
      console.log(priceText);
      // Use a regular expression to extract the price (assuming it's in the format '162,00 грн')
      const match = priceText.match(/(\d{1,6}(?:.\d{1,3}))/);

      // If a match is found, use the captured group as the price, otherwise set it to 'Price not available'
      const price = match ? match[1] : "Price not available";
      console.log(price);
      return { siteAddress, price };
    });
  });
  console.log(prices);
  // Filter out objects with 'Price not available'
  const filteredResults = prices.filter(
    (result) => result.price !== "Price not available",
  );

  console.log("Results:", filteredResults);
  await browser.close();
}
// scrapePromua("712550710");
module.exports = scrapePromua;
