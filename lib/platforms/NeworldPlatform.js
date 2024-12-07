import axios from "axios";
import cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { writeLog, LOG_TYPES } from "../logger.js";
import { sendEmail, createSignTemplate } from "../email.js";
import { BasePlatform } from "./BasePlatform.js";

export class NeworldPlatform extends BasePlatform {
  constructor() {
    super();
    this.baseUrl = "https://neworld.space";
  }

  getName() {
    return "Neworld";
  }

  async login() {
    try {
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 开始登录`);
      const loginURL = `${this.baseUrl}/auth/login`;
      const res = await axios.post(loginURL, {
        email: process.env.neworldUser,
        passwd: process.env.neworldPwd,
      });
      this.headers.Cookie = res.headers["set-cookie"].join(";");
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] ${res.data.msg}`);
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 登录成功`);
    } catch (error) {
      writeLog(LOG_TYPES.ERROR, `[${this.getName()}] 登录失败: ${error.message}`);
      throw error;
    }
  }

  async sign() {
    try {
      writeLog(LOG_TYPES.SIGN, `[${this.getName()}] 开始签到`);
      const signURL = `${this.baseUrl}/user/checkin`;
      const res = await axios.post(signURL, {}, { headers: this.headers });
      writeLog(LOG_TYPES.SIGN, `[${this.getName()}] ${res.data.msg}`);
      sendEmail(`${this.getName()}签到状态`, createSignTemplate(res.data));
      writeLog(LOG_TYPES.SIGN, `[${this.getName()}] 签到状态: ${res.data.msg}`);
      return res.data;
    } catch (error) {
      writeLog(LOG_TYPES.ERROR, `[${this.getName()}] 签到失败: ${error.message}`);
      throw error;
    }
  }

  async getFlow() {
    try {
      const url = `${this.baseUrl}/user`;
      const res = await axios.get(url, { headers: this.headers });
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

      fs.writeFileSync(path.join("./log", "use.html"), res.data);
      writeLog(LOG_TYPES.INFO, `[${this.getName()}] 流量获取成功`);
      return obj;
    } catch (error) {
      writeLog(LOG_TYPES.ERROR, `[${this.getName()}] 获取流量失败: ${error.message}`);
      throw error;
    }
  }
}
