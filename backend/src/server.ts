import "dotenv/config";
import { app } from "./app";

// Bootstrap the Express server with the configured port.
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
