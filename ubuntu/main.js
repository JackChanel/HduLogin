const puppeteer = require("puppeteer");
const schedule = require("node-schedule");
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// 配置文件
const configPath = path.join(__dirname, "config.json");
if (!fs.existsSync(configPath)) {
  throw new Error("请创建config.json配置文件");
}
const { username, password, chromePath } = require(configPath);

// 日志配置
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

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
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      flags: "a",
    }),
  ],
});

let retry = 4;
let pageurl = "";

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  });
}

async function loginAction(page, browser) {
  if (retry-- > 0) {
    try {
      await page.reload();
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
    } catch (error) {
      logger.error(`登录过程中发生错误: ${error.message}`);
    }
  } else {
    logger.error("超过最大重试次数，登录失败");
    await browser.close();
  }
}

function registerListener(page, browser) {
  page.on("load", async () => {
    try {
      await sleep(3000);
      pageurl = page.url();
      if (pageurl.includes("srun_portal_success")) {
        logger.info("登录成功");
        await browser.close();
      } else {
        await loginAction(page, browser);
      }
    } catch (e) {
      logger.error(`页面加载监听错误: ${e.message}`);
    }
  });
}

async function run() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      executablePath: chromePath,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    registerListener(page, browser);

    logger.info("正在访问登录页面");
    await page.goto("https://login.hdu.edu.cn/srun_portal_pc", {
      waitUntil: "networkidle2",
      timeout: 30000,
    });
  } catch (error) {
    logger.error(`浏览器启动失败: ${error.message}`);
  }
}

// 启动任务
logger.info("程序启动");
run();

// 定时任务
schedule.scheduleJob("0 */6 * * *", () => {
  logger.info("定时任务触发");
  retry = 4; // 重置重试次数
  run();
});

// 异常处理
process.on("uncaughtException", (error) => {
  logger.error(`未捕获异常: ${error.message}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`未处理的Promise拒绝: ${reason}`);
});
