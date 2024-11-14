import fs from "fs";
import path from "path";

export function ensureLogDir() {
  // 确保 log 目录存在
  const logDir = "./log";
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  
  // 需要迁移的文件列表
  const filesToMigrate = ['sign.txt', 'use.txt', 'use.html', 'error.txt'];
  
  filesToMigrate.forEach(filename => {
    const oldPath = `./${filename}`;
    const newPath = path.join(logDir, filename);
    
    // 如果旧文件存在且新文件不存在，执行迁移
    if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
      fs.copyFileSync(oldPath, newPath);
      fs.unlinkSync(oldPath); // 删除旧文件
    }
  });
} 