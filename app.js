import express from "express";
import cors from "cors";
import morgan from "morgan";

import cache from "./routes/cache";
import imagery from "./routes/imagery";
import gssurgo from "./routes/gssurgo";
import combo from "./routes/combo";
import fieldgeo from "./routes/fieldgeo";
import marker from "./routes/marker";
import custom from "./routes/custom";
import tree from "./routes/tree";

import { noCache, respond } from "./middlewares/tools";

// Create Express App
const app = express();

// Add timing log
if (process.env.CUSTOM_METRICS === "true") {
  app.use((req, res, next) => {
    res.locals.timing = {};
    res.locals.metrics = {};
    req.on("end", function () {
      console.debug("TIMING DEBUG:", res.locals.timing);
      console.debug("METRICS DEBUG:", res.locals.metrics);
      if (process.env.NEW_RELIC_ENABLED === "true") {
        Object.keys(res.locals.timing).forEach((key) => {
          app.newrelic.recordMetric(`Timing/${key}`, res.locals.timing[key]);
        });
        Object.keys(res.locals.metrics).forEach((key) => {
          app.newrelic.recordMetric(key, res.locals.metrics[key]);
        });
      }
    });
    next();
  });
}

// Add CORS
app.use(cors({ origin: "*" }));

// Add logger
if (process.env.NODE_ENV !== "test") {
  morgan.token("error", (req) => {
    if (req.error) {
      console.error(req.error);
    }
    return req.error;
  });

  if (process.env.LOG_REQUESTS === "true") {
    app.use(morgan(":date[iso] :remote-addr :referrer :url", { immediate: true }));
  }

  app.use(morgan(":date[iso] :remote-addr :referrer :url :status :res[content-length] :response-time :error"));
}

// Debugging for tests
if (process.env.NODE_ENV === "test") {
  app.use((req, res, next) => {
    console.debug(req.url);
    next();
  });
}

// Add layer controllers
app.use("/cache", cache);
app.use("/imagery", imagery);
app.use("/soil", gssurgo);
app.use("/combo", combo);
app.use("/fieldgeo", fieldgeo);
app.use("/marker", marker);
app.use("/custom", custom);
app.use("/tree", tree);

// Redirect root to status
app.get("/", (req, res) => {
  res.redirect("/status");
});

// Server status check
app.get(
  "/status",
  noCache,
  (req, res, next) => {
    res.locals.data = process.env.npm_package_version;
    next();
  },
  respond
);

// Default handler
app.use((error, req, res, next) => {
  if (error) {
    req.error = error;
    res.status(error.code || 500);
    res.send(error.message);
  } else {
    res.sendStatus(404);
  }
});

export default app;
