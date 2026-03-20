import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: ".env.dev" });

const startServer = async () => {
  // await connectCommonDB();

  app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`);
  });
};

startServer();