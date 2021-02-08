import fs from "fs";

import Redis from "ioredis";
import Redlock from "redlock";
import AWS from "aws-sdk";

import { flush } from "./cache";

const redis = new Redis({ host: process.env.REDIS_HOST });
const redlock = new Redlock([redis], {
  retryCount: -1,
});

const s3 = new AWS.S3({
  maxRetries: 10,
});

// Download file from S3 to the local cache
const downloadFile = (req, res, next) => {
  const { dir, filename, key } = res.locals;
  const { bucket, region } = req.query;

  const dirPath = `${process.env.CACHE_PATH}/${dir}/${region}/${bucket}`;
  const path = `${dirPath}/${filename}`;

  const download = async () => {
    // If file already exists, set path and call next middleware
    if (fs.existsSync(path)) {
      res.locals.path = path;
      return next();
    }

    // Get the lock to avoid multiple downloads for the same file
    const lock = await redlock.lock(filename, 10000);

    // If something fails, unlock the queue and respond with error
    const fail = () => {
      lock.unlock().catch(next);
      res
        .status(404)
        .send("Error downloading source data file, please check params");
    };

    // Before calling download recursively, we have to unlock the queue
    // If the unlock fails is because the lock was lost so we can ignore the error
    const retry = () => {
      lock.unlock().catch((e) => {});
      download();
    };

    // Download error handler
    const onError = (error) => {
      // If file not found, trigger error!
      if (error.code === "NoSuchKey") {
        return fail();
      }

      // If cache dir is full, remove files older than 10 days and retry
      if (error.code === "ENOSPC") {
        req.query.age = 10;
        return flush(req, res, retry);
      }

      retry();
    };

    // This is about milliseconds and it does not happen often
    // but sometimes the file gets downloaded just after the function gets the lock
    if (fs.existsSync(path)) {
      return retry();
    }

    // Download file from S3 to local cache
    s3.getObject({ Bucket: bucket, Key: key })
      .promise()
      .then((data) => {
        fs.writeFileSync(path, data.Body, onError);
        setTimeout(retry, 1000);
      })
      .catch(onError);
  };

  // Create directory and trigger download
  fs.mkdirSync(dirPath, { recursive: true });
  download();
};

// Download GeoTiff
export const downloadTiff = (req, res, next) => {
  res.locals.filename = `${req.params.imagery}.tif`;
  res.locals.key = `${req.params.imagery}.tif`;
  res.locals.dir = "imagery";
  downloadFile(req, res, next);
};

// Download Shapefile
export const downloadShape = (req, res, next) => {
  res.locals.filename = `${req.params.custom}.zip`;
  res.locals.key = req.params.custom;
  res.locals.dir = "custom";
  downloadFile(req, res, next);
};
