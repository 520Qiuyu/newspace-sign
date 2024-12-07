import axios from "axios";
import cheerio from "cheerio";
import { writeLog, LOG_TYPES } from "../logger.js";
import { sendEmail, createSignTemplate } from "../email.js";
import { BasePlatform } from "./BasePlatform.js";

export class IkuuuVpnPlatform extends BasePlatform {
  constructor() {
    super();
    this.baseUrl = "https://ikuuu.one"; // 假设这是ikuuu的域名
  }

  getName() {
    return "ikuuuVPN";
  }

  async login() {
    try {
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 开始登录`);
      const loginURL = `${this.baseUrl}/auth/login`;
      const res = await axios.post(loginURL, {
        host: "ikuuu.one",
        email: "1943684871@qq.com",
        passwd: "20010829qiuyu",
        code: "",
        remember_me: "on",
      });
      const cookies = res.headers["set-cookie"];
      const cookieObj = {};
      for (const cookie of cookies) {
        const [name, value] = cookie.split(";")[0].split("=");
        cookieObj[name] = value;
      }
      this.headers.Cookie = Object.entries(cookieObj)
        .map(([name, value]) => `${name}=${value}`)
        .join(";");
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] ${res.data.msg}`);
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 登录成功`);
    } catch (error) {
      writeLog(
        LOG_TYPES.ERROR,
        `[${this.getName()}] 登录失败: ${error.message}`
      );
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
      writeLog(
        LOG_TYPES.ERROR,
        `[${this.getName()}] 签到失败: ${error.message}`
      );
      throw error;
    }
  }

  async getFlow() {
    try {
      writeLog(LOG_TYPES.INFO, `[${this.getName()}] 开始获取流量信息`);
      const userURL = `${this.baseUrl}/user`;
      const res = await axios.get(userURL, { headers: this.headers });
      const $ = cheerio.load(res.data);

      // 这里需要根据实际的页面结构来获取流量信息
      const flowInfo = {
        balance: $(".card-statistic-2").eq(3).find(".card-body").text().trim(),
        todayUsed: $(".card-statistic-2")
          .eq(1)
          .find(".card-stats-title")
          .text()
          .trim(),
        totalUsed: $(".card-statistic-2")
          .eq(2)
          .find(".card-stats-title")
          .text()
          .trim(),
      };

      writeLog(LOG_TYPES.INFO, `[${this.getName()}] 流量信息获取成功`);
      return flowInfo;
    } catch (error) {
      writeLog(
        LOG_TYPES.ERROR,
        `[${this.getName()}] 获取流量信息失败: ${error.message}`
      );
      throw error;
    }
  }
}
