import { Application } from "thinkts";

const port = parseInt(process.env.PORT || "3333", 10);
const app = new Application({ ROOT_PATH: __dirname, port });
app.run().then(() => {
  console.log(`ThinkTS API running on http://0.0.0.0:${port}`);
});
