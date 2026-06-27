import express from "express";
import cors from "cors";

import corsOptions from "./config/cors.js";
import { errorMiddleware } from "./middlewares/error.js";
import { notFoundMiddleware } from "./middlewares/notFound.js";
import subscriptionRoutes from "./routes/subscription.routes.js";

const app = express();

app.use(express.json());
app.use(cors(corsOptions));


app.use("/api/subscriptions", subscriptionRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;