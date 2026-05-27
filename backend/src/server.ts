import "dotenv/config";
import { app } from "./app";

// Bootstrap the Express server with the configured port.
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
