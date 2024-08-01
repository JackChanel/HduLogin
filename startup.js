const path = require("path");
const Service = require("node-windows").Service;
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)) // 隐藏Node.js和脚本名称
  .usage("使用方式：$0 --param1 [value1]")
  .option("mode", {
    describe: "服务的模式",
    type: "string",
    demandOption: true, // 这个参数是必需的
    alias: "m", // 别名
    choices: ["install", "uninstall"], // 可选值
  })
  .help() // 生成帮助信息
  .alias("help", "h").argv; // 定义help的别名

const mode = argv.mode;

const svc = new Service({
  name: "HDU-Portal-Login",
  description: "杭电校园网自动登录服务",
  script: path.join(__dirname, "main.js"),
});

function installService() {
  svc.on("install", function () {
    svc.start();
  });
  svc.install();
}

function uninstallService() {
  svc.on("uninstall", function () {
    console.log("Uninstall complete.");
    console.log("The service exists: ", svc.exists);
  });
  svc.uninstall();
}

if (mode === "install") {
  installService();
} else if (mode === "uninstall") {
  uninstallService();
} else {
  console.log("Invalid mode.");
}
