import fs from "fs";
import path from "path";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn.js";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

// 加载插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 设置语言和时区
dayjs.locale("zh-cn");
dayjs.tz.setDefault("Asia/Shanghai");

// 定义日志类型
export const LOG_TYPES = {
  ERROR: "error",
  LOGIN: "login",
  SIGN: "sign",
  USAGE: "usage",
  INFO: "info",
};

// 确保日志目录存在
const ensureLogDirectory = () => {
  const logDir = "./log";
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

export const getLogItem = message => {
  const timeStr = dayjs().tz().format("YYYY-MM-DD HH:mm:ss");
  console.log("timeStr", timeStr);
  return `[${timeStr}] ${message}\n`;
};

export const writeLog = async (type, message) => {
  try {
    if (!Object.values(LOG_TYPES).includes(type)) {
      throw new Error(`Invalid log type: ${type}`);
    }

    const logPath = path.join("./log", `${type}.txt`);
    await fs.promises.appendFile(logPath, getLogItem(message));
  } catch (error) {
    console.error("写入日志失败:", error);
    // 如果写入失败，尝试写入错误日志
    if (type !== LOG_TYPES.ERROR) {
      await writeLog(LOG_TYPES.ERROR, `日志写入失败: ${error.message}`);
    }
  }
};

// 初始化日志系统
const initializeLogger = async () => {
  try {
    ensureLogDirectory();

    // 初始化所有日志文件
    await Promise.all(
      Object.values(LOG_TYPES).map(async type => {
        const logPath = path.join("./log", `${type}.txt`);
        if (!fs.existsSync(logPath)) {
          await writeLog(type, "日志系统初始化");
        }
      })
    );
  } catch (error) {
    console.error("日志系统初始化失败:", error);
  }
};

// 执行初始化
initializeLogger();
