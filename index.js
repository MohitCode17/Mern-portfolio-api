import { app } from "./src/app.js";
import { config } from "./src/config/env-config.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
