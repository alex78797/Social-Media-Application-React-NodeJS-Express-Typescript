import express from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { postsRouter } from "./routes/posts.routes";
import { authRouter } from "./routes/auth.routes";
import { commentsRouter } from "./routes/comments.routes";
import { likesRouter } from "./routes/likes.routes";
import { usersRouter } from "./routes/users.routes";
import { relationshipsRouter } from "./routes/relationships.routes";
import { uploadFilerRouter } from "./routes/uploadFile.routes";
import { limiter, limiterAuth } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { requestHandler } from "./middleware/requestHandler.middleware";
import { cleanFolder } from "./scheduledJobs/cleanFolders";
import schedule from "node-schedule";

// initialize the app/server
const app = express();

// save the port number from the .env file
const port = process.env.PORT;

// some extra security (this blocks requesting image from the public directory)
app.use(helmet());

// configure cors with the allowed origin and also allow sending cookies
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// needed to send/receive data in json format to/from the client
app.use(express.json());

// needed to send/receive cookies to/from the client
app.use(cookieParser());

// serve static files
// app.use("/static", express.static("public"));

// use the limiter middleware to help prevent brute-force attacks: limit the amount of requests possible within a time period
// app.use(limiter);

// use the request handler middleware
// app.use(requestHandler);

// use the created routes
app.use("/api/upload", uploadFilerRouter);

// app.use("/api/auth", limiterAuth, authRouter);
app.use("/api/auth", authRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/posts", postsRouter);
app.use("/api/relationships", relationshipsRouter);
app.use("/api/users", usersRouter);

// use the error handler middleware
app.use(errorHandler);

// scheduled jobs. These jobs run every 5 seconds. Link: https://www.npmjs.com/package/node-schedule
// const job1 = schedule.scheduleJob(
//   "*/5 * * * * *",
//   async () => await cleanFolder("../CLIENT_FRONTEND/public/userUploads")
// );

// const job2 = schedule.scheduleJob(
//   "*/5 * * * * *",
//   async () => await cleanFolder("../SERVER_BACKEND/src/public/img")
// );

// run the server on the given port
app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
