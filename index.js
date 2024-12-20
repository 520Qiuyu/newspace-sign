import { config } from "dotenv";
import { scheduleJob } from "node-schedule";
import { sendEmail } from "./lib/email.js";
import { writeLog } from "./lib/logger.js";
import { ensureLogDir } from "./lib/utils.js";
import { PlatformManager } from "./lib/platforms/PlatformManager.js";
import createServer from "./server/index.js";

// 创建并启动 Express 服务器
const app = createServer();
app.listen(8080, () => {
  console.log('日志服务器运行在 http://localhost:8080');
  writeLog('info', '日志服务器启动成功');
});

async function runPlatformTasks(platformManager, tasks) {
  for (const platform of platformManager.getAllPlatforms()) {
    try {
      await platform.login();
      for (const task of tasks) {
        await platform[task]();
      }
    } catch (error) {
      console.error(`[${platform.getName()}] error:`, error);
      writeLog('error', `[${platform.getName()}] ${error.message}`);
      sendEmail(`[${platform.getName()}] 程序错误`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fee; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #e74c3c; text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
            程序错误警告
          </h2>
          <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="color: #e74c3c; font-size: 16px; font-weight: bold;">
              ${error.message}
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
            错误时间: ${new Date().toLocaleString()}
          </div>
        </div>
      `);
    }
  }
}

async function main() {
  try {
    // 确保日志目录存在并迁移历史数据
    ensureLogDir();
    
    writeLog('info', "程序开始执行");
    config();

    // 创建平台管理器
    const platformManager = PlatformManager.createDefaultManager();

    // 执行初始任务
    await runPlatformTasks(platformManager, ['sign', 'getFlow']);

    // 设置定时任务，每天早上八点执行签到 (使用北京时间)
    scheduleJob({rule: process.env.signTime, tz: 'Asia/Shanghai'}, async function () {
      writeLog('info', "定时签到任务执行于 " + new Date());
      await runPlatformTasks(platformManager, ['sign', 'getFlow']);
    });

    // 每天23:59执行获取使用流量情况 (使用北京时间)
    scheduleJob({rule: "59 23 * * *", tz: 'Asia/Shanghai'}, async function () {
      writeLog('info', "定时流量检查任务执行于 " + new Date());
      await runPlatformTasks(platformManager, ['getFlow']);
    });

  } catch (error) {
    console.error("error", error);
    writeLog('error', error.message);
    sendEmail("程序错误", `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fee; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <h2 style="color: #e74c3c; text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
          程序错误警告
        </h2>
        <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="color: #e74c3c; font-size: 16px; font-weight: bold;">
            ${error.message}
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
          错误时间: ${new Date().toLocaleString()}
        </div>
      </div>
    `);
  }
}

main();
