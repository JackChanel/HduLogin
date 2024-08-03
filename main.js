const puppeteer = require("puppeteer");
const schedule = require("node-schedule");
const winston = require("winston");
const { username, password, chromePath } = require("./config.json");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toLocaleString(),
    }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/app.log" }),
  ],
});
let retry = 4;
let pageurl = "";

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
  });
  const page = await browser.newPage("https://login.hdu.edu.cn/srun_portal_pc");
  registerListener(page, browser);
  await page.goto("https://login.hdu.edu.cn/srun_portal_pc");
  await page.waitForNavigation();
  await loginAction(page, browser);
}

async function loginAction(page, browser) {
  if (retry-- > 0) {
    const userInput = await page.$("#username");
    const passwordInput = await page.$("#password");
    const loginButton = await page.$("#login-account");
    if (userInput && passwordInput && loginButton) {
      await userInput.type(username);
      await sleep(1000);
      await passwordInput.type(password);
      await sleep(1000);
      await loginButton.click();
      await sleep(5000);
    }
  } else {
    logger.error("Login failed");
    browser.close();
  }
}

function registerListener(page, browser) {
  page.on("load", async () => {
    try {
      await sleep(5000);
      pageurl = page.url();
      if (pageurl.includes("srun_portal_success")) {
        logger.info("Login success");
        browser.close();
      } else {
        await loginAction(page, browser);
      }
    } catch (e) {
      logger.error("Login failed", e);
    }
  });
}

// quick-start
run();
// preserve-start
setTimeout(() => {
  run();
}, 5 * 60 * 1000);
// refresh every 6 hours
schedule.scheduleJob("0 */6 * * *", function () {
  logger.info("开始登录");
  run();
});
