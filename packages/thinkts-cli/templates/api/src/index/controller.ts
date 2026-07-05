import { BaseController } from "thinkts";

/** Default index controller. */
export default class IndexController extends BaseController {
  indexAction() {
    return this.success({ message: "ThinkTS API", version: "1.0.0" });
  }
}
