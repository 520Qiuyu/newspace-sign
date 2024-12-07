import { writeLog, LOG_TYPES } from "../lib/logger.js";
import axios from "axios";


async function login() {
    try {
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 开始登录`);
      const loginURL = `${this.baseUrl}/auth/login`;
      const res = await axios.post(loginURL, {
        host: "ikuuu.one",
        email: process.env.ikuuuUser,
        passwd: process.env.ikuuuPwd,
        code: "",
        remember_me: "on",
      });
      this.headers.Cookie = res.headers["set-cookie"].join(";");
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] ${res.data.msg}`);
      writeLog(LOG_TYPES.LOGIN, `[${this.getName()}] 登录成功`);
    } catch (error) {
      writeLog(LOG_TYPES.ERROR, `[${this.getName()}] 登录失败: ${error.message}`);
      throw error;
    }
  }