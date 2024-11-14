import fs from 'fs';
import path from 'path';

export const renderLogsPage = (req, res) => {
  res.render('logs');
};

// 添加时间格式化函数
function formatDateTime(dateTimeStr) {
  // 解析类似 "11/8/2024, 4:53:59 AM" 的时间格式
  const date = new Date(dateTimeStr);
  
  // 格式化为 "YYYY-MM-DD HH:mm:ss"
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const getLogs = (req, res) => {
  const logType = req.query.type || 'error';
  try {
    const logPath = path.join('./log', `${logType}.txt`);
    console.log('正在读取日志文件:', logPath);
    
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      
      // 使用正则表达式匹配完整的日志项（从时间戳到下一个时间戳之前）
      const logEntries = [];
      let currentEntry = '';
      const lines = content.split('\n');
      
      for (let line of lines) {
        // 匹配时间戳格式
        const timeMatch = line.match(/^\[(.*?)\]/);
        if (timeMatch) {
          // 如果遇到新的时间戳，保存之前的条目（如果存在）
          if (currentEntry) {
            logEntries.push(currentEntry.trim());
          }
          // 格式化时间戳
          const formattedTime = formatDateTime(timeMatch[1]);
          currentEntry = `[${formattedTime}]${line.slice(timeMatch[0].length)}`;
        } else if (line.trim()) {
          // 如果不是空行，添加到当前条目
          currentEntry += '\n' + line;
        }
      }
      
      // 添加最后一个条目
      if (currentEntry) {
        logEntries.push(currentEntry.trim());
      }

      // 返回反转后的日志数组（最新的在前面）
      res.json({ success: true, data: logEntries.reverse() });
    } else {
      console.log('日志文件不存在');
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('读取日志出错:', error);
    res.json({ success: false, error: error.message });
  }
}; 