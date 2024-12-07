export class BasePlatform {
  constructor(config) {
    this.config = config;
    this.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    };
  }

  async login() {
    throw new Error('Platform must implement login method');
  }

  async sign() {
    throw new Error('Platform must implement sign method');
  }

  async getFlow() {
    throw new Error('Platform must implement getFlow method');
  }

  getName() {
    throw new Error('Platform must implement getName method');
  }
}
