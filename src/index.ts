import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const TIMEOUT = 300000;

const EMAIL = process.env.FIGMA_EMAIL;
const PASSWORD = process.env.FIGMA_PASSWORD;
const FILE_ID = process.env.FIGMA_FILE_ID;

if (!EMAIL || !PASSWORD || !FILE_ID) {
  throw new Error(
    "Please specify FIGMA_EMAIL, FIGMA_PASSWORD and FIGMA_FILE_ID in the .env file"
  );
}

const downloadPath = path.resolve("./output");

if (!fs.existsSync(downloadPath)) {
  fs.mkdirSync(downloadPath);
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(TIMEOUT);
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto("https://www.figma.com/login", {
      waitUntil: "networkidle2",
    });

    await page.type('input[name="email"]', EMAIL);
    await page.type('input[name="password"]', PASSWORD);

    await page.click('button[type="submit"]');

    const [response] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/login") && response.status() === 200
      ),
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    ]);

    if (response.ok()) {
      console.log("Authorisation successful");
    }

    const client = await page.createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath,
    });

    await page.goto(`https://www.figma.com/design/${FILE_ID}`, {
      waitUntil: "networkidle0",
    });

    await page.keyboard.down("Meta");
    await page.keyboard.press("/");
    await page.keyboard.up("Meta");

    await page.waitForFunction(
      () => document.activeElement?.tagName === "INPUT"
    );

    await page.keyboard.type("Save local copy");
    await page.keyboard.press("Enter");

    // await page.waitForSelector('button[id="toggle-menu-button"]', { visible: true });
    // await page.click('button[id="toggle-menu-button"]');
    // await page.hover('div[data-testid="dropdown-option-File"]');
    // await page.waitForSelector('div[data-testid="dropdown-option-Save local copy…"]', { visible: true });
    // await page.click('div[data-testid="dropdown-option-Save local copy…"]');

    console.log("Process of preparing for loading has begun....");

    await new Promise<void>((resolve) => {
      let initialFiles = fs.readdirSync(downloadPath);

      const interval = setInterval(() => {
        let currentFiles = fs.readdirSync(downloadPath);
        let diff = currentFiles.filter((x) => !initialFiles.includes(x));
        if (diff.length > 0) {
          const downloadedFile = diff[0];
          console.log("File downloaded:", downloadedFile);

          // Переименование файла с добавлением текущего времени
          const now = new Date();
          const timestamp = now.toISOString().replace(/[:.-]/g, "_");
          const oldPath = path.join(downloadPath, downloadedFile);
          const newFileName = `${path.parse(downloadedFile).name
            }_${timestamp}${path.extname(downloadedFile)}`;
          const newPath = path.join(downloadPath, newFileName);

          fs.renameSync(oldPath, newPath);
          console.log("File renamed to:", newFileName);

          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });

    console.log("File successfully uploaded");
  } catch (error) {
    console.error("There was a mistake:", error);
  } finally {
    await browser.close();
  }
})();
