import nodemailer from "nodemailer";
import { writeLog } from "./logger.js";

const createTransporter = () => {
  // 打印邮件配置信息（注意不要泄露密码）
  console.log("邮件配置:", {
    service: process.env.service,
    secureConnection: true,
    port: 465, // SMTP 端口
    auth: {
      user: process.env.emailFrom, // 发送邮件的邮箱
      pass: process.env.emailPass, // 发送邮件的邮箱密码或授权码
    },
  });

  return nodemailer.createTransport({
    service: process.env.service,
    secureConnection: true,
    port: 465, // SMTP 端口
    auth: {
      user: process.env.emailFrom, // 发送邮件的邮箱
      pass: process.env.emailPass, // 发送邮件的邮箱密码或授权码
    },
  });
};

export const sendEmail = async (subject, html) => {
  try {
    const transporter = createTransporter();

    // 测试邮件服务器连接
    await transporter.verify();
    writeLog("info", "邮件服务器连接成功");

    // 解析收件人列表
    let recipients;
    try {
      recipients = JSON.parse(process.env.emailTo);
    } catch (e) {
      recipients = process.env.emailTo; // 如果解析失败，直接使用字符串
    }

    const info = await transporter.sendMail({
      from: process.env.emailFrom, // 使用正确的环境变量名
      to: recipients, // 使用解析后的收件人列表
      subject: subject,
      html: html,
    });
    writeLog("info", `邮件发送成功: ${subject}`);
    return info;
  } catch (error) {
    console.log("error", error);
    writeLog("error", `邮件发送失败: ${error.message}`);
    // 打印详细错误信息
    console.error("邮件发送错误详情:", {
      message: error.message,
      code: error.code,
      command: error.command,
      emailFrom: process.env.emailFrom,
      emailTo: process.env.emailTo,
      service: process.env.service,
    });
    throw error;
  }
};

// 创建签到状态的HTML模板
export function createSignTemplate(data) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        签到状态通知
      </h2>
      <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p style="color: ${
          data.ret === 1 ? "#27ae60" : "#e74c3c"
        }; font-size: 18px; font-weight: bold; text-align: center;">
          ${data.msg}
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
        发送时间: ${new Date().toLocaleString()}
      </div>
    </div>
  `;
}

// 创建流量使用情况的HTML模板
export function createFlowTemplate(data) {
  const items = Object.entries(data)
    .map(([key, value]) => {
      const isImportant = ["剩余流量", "今日用量", "过期时间"].includes(key);
      return `
      <div style="display: flex; justify-content: space-between; padding: 10px; ${
        isImportant ? "background: #f1f8ff;" : ""
      } border-radius: 5px; margin: 5px 0;">
        <span style="color: #34495e; font-weight: ${
          isImportant ? "bold" : "normal"
        };">${key}:</span>
        <span style="color: ${isImportant ? "#3498db" : "#7f8c8d"}; font-weight: ${
        isImportant ? "bold" : "normal"
      };">${value}</span>
      </div>
    `;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
        流量使用情况
      </h2>
      <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 20px;">
        ${items}
      </div>
      <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 12px;">
        发送时间: ${new Date().toLocaleString()}
      </div>
    </div>
  `;
}

