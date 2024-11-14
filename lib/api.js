import axios from "axios";
import cheerio from "cheerio";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { writeLog, LOG_TYPES } from "./logger.js";
import { sendEmail, createSignTemplate, createFlowTemplate } from "./email.js";

const headers = {
  Cookie: process.env.cookie,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
};

export async function login() {
  try {
    writeLog(LOG_TYPES.LOGIN, "开始登录");
    const loginURL = "https://neworld.space/auth/login";
    const res = await axios.post(loginURL, {
      email: process.env.user,
      passwd: process.env.pwd,
    });
    console.log(res.data);
    headers.Cookie = res.headers["set-cookie"].join(";");
    writeLog(LOG_TYPES.LOGIN, res.data.msg);
    writeLog(LOG_TYPES.LOGIN, "登录成功");
  } catch (error) {
    console.log(error);
    writeLog(LOG_TYPES.ERROR, `登录失败: ${error.message}`);
  }
}

export async function sign() {
  try {
    writeLog(LOG_TYPES.SIGN, "开始签到");
    const signURL = "https://neworld.space/user/checkin";
    const res = await axios.post(signURL, {}, { headers });
    console.log(res.data);
    writeLog(LOG_TYPES.SIGN, res.data.msg);
    sendEmail("签到状态", createSignTemplate(res.data));
    writeLog(LOG_TYPES.SIGN, "签到成功");
  } catch (error) {
    console.log("error", error);
    writeLog(LOG_TYPES.ERROR, `签到失败: ${error.message}`);
  }
}

export async function getFlow() {
  try {
    const url = "https://neworld.space/user";
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const title = "流量用量";
    const obj = {
      注册邮箱: "",
      最近使用时间: "",
      过期时间: "",
      等级过期时间: "",
      剩余流量: "",
      账户余额: "",
      过去用量: "",
      今日用量: "",
    };

    $(".card").each((index, element) => {
      if ($(element).find(".card-title").text() == title) {
        $(element)
          .find(".row>div")
          .each((i, e) => {
            const entries = $(e).text().trim().split(/\s+/);
            if (entries[0] in obj) {
              obj[entries[0]] = entries[1];
            }
          });
      }
    });

    const match = res.data.match(/window\.intercomSettings\s*=\s*{([^;]+)};/);
    if (match && match[1]) {
      const jsonString = match[1];
      const entries = jsonString.split(",").map(item => item.split(":").map(str => str.trim()));

      entries.forEach(e => {
        if (e[0] in obj) {
          obj[e[0]] = e.slice(1).join("").trim();
        }
      });
    }

    // 保存原始HTML响应
    fs.writeFileSync(path.join("./log", "use.html"), res.data);

    // 将所有信息合并为一条日志
    const logMessage = `
流量使用情况:
今日用量: ${obj.今日用量}
过去用量: ${obj.过去用量}
账户余额: ${obj.账户余额}
剩余流量: ${obj.剩余流量}
等级过期时间: ${obj.等级过期时间}
过期时间: ${obj.过期时间}
最近使用时间: ${obj.最近使用时间}
注册邮箱: ${obj.注册邮箱}
    `.trim();

    writeLog(LOG_TYPES.USAGE, logMessage);
    sendEmail("使用情况", createFlowTemplate(obj));
    writeLog(LOG_TYPES.USAGE, "获取流量信息成功");
  } catch (error) {
    console.log("error", error);
    writeLog(LOG_TYPES.ERROR, `获取流量失败: ${error.message}`);
  }
}

