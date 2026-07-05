import { BaseService as ThinkBaseService } from "thinkts";
import type { AuthInfo } from "./types";
import { extractAuth } from "./types";

export class AppService extends ThinkBaseService {
  protected get auth(): AuthInfo {
    return extractAuth(this.ctx!);
  }
}

export default AppService;
