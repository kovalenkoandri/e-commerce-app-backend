const puppeteer = require("puppeteer");

// async function scrapeAvtoProResults(query) {
//   const browser = await puppeteer.launch({ headless: "new" });
//   const page = await browser.newPage();
//   await page.goto(`https://avto.pro`);
//   await page.type(".pro-input.pro-input--framed.ap-search__input", query);
//   const searchResultSelector = ".ap-search__column";
//   await page.waitForSelector(searchResultSelector);
//   await page.click(searchResultSelector);
//    const trSelector = "tr[data-is-supplier]";
//    await page.waitForSelector(trSelector);
//   const prices = await page.evaluate( () => {
//     const resultElements = document.querySelectorAll("tr[data-is-supplier]");
//     console.log(resultElements);
//     return Array.from(resultElements, async (element) => {
//       await page.click(trSelector);
//       const priceValueSelector = ".pro-card__price__value";
//       await page.waitForSelector(priceValueSelector);
//       const priceElement = element.querySelector(priceValueSelector);
//       console.log(priceElement);
//       const priceText = priceElement
//         ? priceElement?.textContent
//         : "Price not available";

//       return { priceText };
//     });
//   });

//   console.log("Prices:", prices);

//   await browser.close();
// }

async function scrapeAvtoProResults(query) {
  // const browser = await puppeteer.launch({ headless: "new" });
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`https://avto.pro`);
  const inputSelector = ".pro-input.pro-input--framed.ap-search__input";
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, query);
  const searchResultSelector = ".ap-search__column";
  await page.waitForSelector(searchResultSelector);
  await page.click(searchResultSelector);
  const trSelector = "tr[data-is-supplier]";
  await page.waitForSelector(trSelector);
  // Use page.evaluate to run code in the context of the browser page
  // const prices = await page.evaluate(() => {
  //   console.log('asdas');
  const pricesArray = [];
  
  await page.click(trSelector); // Click on each result element
  
  const priceValueSelector = ".pro-card__price__value";
  await page.waitForSelector(priceValueSelector);
  const evaluated = await page.evaluate(() => {
    const resultElements = document.querySelectorAll("tr[data-is-supplier]");
    // resultElements.forEach(async (element) => {
    const priceElement = document.querySelector(".pro-card__price__value");
    const priceText = priceElement
      ? priceElement.textContent
      : "Price not available";
    return priceText;
  });
  pricesArray.push({ evaluated });
  console.log(pricesArray);
  // });

  // return pricesArray;
  // });

  // console.log("Prices:", prices);

  // await browser.close();
}

// scrapeAvtoProResults("712550710");
module.exports = scrapeAvtoProResults;
