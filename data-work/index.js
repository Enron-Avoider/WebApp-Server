const express = require("express");
const puppeteer = require("puppeteer");

const app = express();

app.get("/by-ticker/:ticker", async (req, res) => {

    // console.log({ p: req.params });

  // puppeteer.launch() => Chrome running locally (on the same hardware)
  let browser = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://finviz.com/quote.ashx?t=${req.params.ticker}`);
    // const screenshot = await page.screenshot();

    const data = await page.$$eval(
      ".fullview-title .fullview-links >a",
      (nodes) =>
        nodes.map((node) => ({
          name: node.innerText,
          url: node.getAttribute("href"),
        }))
    );

    // document.querySelectorAll("input[placeholder='Search ticker, company or profile']")

    // console.log({data});

    res.jsonp({ data });
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).send(error.message);
    }
  } finally {
    if (browser) {
      browser.close();
    }
  }
});

app.get("/by-name/:name", async (req, res) => {

  let browser = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://finviz.com/`);

    const searchInput = await page.$("input[placeholder='Search ticker, company or profile']");

    await searchInput.type(`${req.params.name}`);
    await searchInput.press('Enter');
    
    await page.waitForNavigation();

    const screenshot = await page.screenshot();

    // const data = await page.$$eval(
    //   ".fullview-title .fullview-links >a",
    //   (nodes) =>
    //     nodes.map((node) => ({
    //       name: node.innerText,
    //       url: node.getAttribute("href"),
    //     }))
    // );

    // document.querySelectorAll("input[placeholder='Search ticker, company or profile']")

    // console.log({data});

    res.end(screenshot, 'binary');
  } catch (error) {
    if (!res.headersSent) {
      res.status(400).send(error.message);
    }
  } finally {
    if (browser) {
      browser.close();
    }
  }
});

app.listen(8080, () => console.log("Listening on PORT: 8080"));
