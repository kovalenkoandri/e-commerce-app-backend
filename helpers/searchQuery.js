const puppeteer = require("puppeteer");
const searchQuery = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://developer.chrome.com/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into search box
  await page.type(".devsite-search-field", "empty");

  // // Wait and click on first result
  const searchResultSelector = "#suggestion-partial-query-0>a";
  await page.waitForSelector("#suggestion-partial-query-0>a");
  await page.click(searchResultSelector);
  // Locate the full title with a unique string
  const searchResultSelector1 =
    // "div.gsc-expansionArea > div:nth-of-type(1) div.gsc-thumbnail-inside a";
    'a[data-ctorig="https://developer.chrome.com/blog/deps-rems-90"]';
  await page.waitForSelector(searchResultSelector1);
  const textSelector = await page.click(searchResultSelector1);
  
  //   // Print the full title
  // const bodyHandle = await page.$(".devsite-page-title");
  // const html = await page.evaluate((body) => body.textContent, bodyHandle);
  // console.log(html);
  // await bodyHandle.dispose();
//  const textSelector2 = await page.waitForSelector('#return_empty_for_navigatorplugins_and_navigatormimetypes > span',
 const textSelector2 = await page.waitForSelector(".devsite-page-title");
  const fullTitle = await textSelector2?.evaluate((el) => el.textContent);
  console.log(fullTitle);
  await browser.close();
};
// searchQuery();
module.exports = searchQuery;
