import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logsRouter from './routes/logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createServer = () => {
  const app = express();

  // 设置模板引擎
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // 静态文件服务
  app.use(express.static('public'));

  // 路由
  app.use('/', logsRouter);

  return app;
};

export default createServer; 