import { NeworldPlatform } from "./NeworldPlatform.js";
import { IkuuuVpnPlatform } from "./IkuuuVpnPlatform.js";
import { writeLog, LOG_TYPES } from "../logger.js";

export class PlatformManager {
  constructor() {
    this.platforms = new Map();
  }

  registerPlatform(platform) {
    this.platforms.set(platform.getName(), platform);
    writeLog(LOG_TYPES.INFO, `注册平台: ${platform.getName()}`);
  }

  getPlatform(name) {
    return this.platforms.get(name);
  }

  getAllPlatforms() {
    return Array.from(this.platforms.values());
  }

  static createDefaultManager() {
    const manager = new PlatformManager();
    // 注册默认平台
    manager.registerPlatform(new NeworldPlatform());
    manager.registerPlatform(new IkuuuVpnPlatform());
    return manager;
  }
}
