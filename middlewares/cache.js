import fs from "fs";
import AWS from "aws-sdk";

const cloudFront = new AWS.CloudFront();

// Set response data
export const cacheResponse = (req, res, next) => {
  const { files = [], invalidations = [] } = res.locals;

  res.locals.data = {
    files: files.length,
    invalidations: invalidations.length,
  };

  res.set("Content-Type", "application/json");

  next();
};

// Flush the whole cache limit by file age
// Age is about the last time the file was accessed (not when it was created)
export const flush = (req, res, next) => {
  const { age } = req.query;
  const now = Date.now();
  const files = [];

  // Calculate limit age in milliseconds
  const limit = age * 86400000;

  const flushDir = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const path = `${dir}/${file}`;
      const stats = fs.statSync(path);

      if (stats.isDirectory()) {
        flushDir(path);
      } else {
        if (limit < now - stats.atimeMs) {
          fs.unlinkSync(path);
          files.push(path);
        }
      }
    });
  };

  flushDir(`${process.env.CACHE_PATH}/imagery`);
  flushDir(`${process.env.CACHE_PATH}/custom`);

  res.locals.files = files;

  next();
};

// Remove single file from the cache
const removeFile = (req, res, next) => {
  const { bucket, region } = req.query;
  const { dir, filename } = res.locals;

  const path = `${process.env.CACHE_PATH}/${dir}/${region}/${bucket}/${filename}`;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    res.locals.files = [path];
  }

  next();
};

// Invalidate CloudFront
export const invalidate = (req, res, next) => {
  const { path, wait } = req.query;

  const params = {
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION,
    InvalidationBatch: {
      CallerReference: `${Date.now()}`,
      Paths: {
        Quantity: path.length,
        Items: path,
      },
    },
  };

  cloudFront
    .createInvalidation(params)
    .promise()
    .then((data) => {
      res.locals.invalidations = data.Invalidation.InvalidationBatch.Paths.Items;

      if (!wait) {
        return next();
      }

      const params = {
        DistributionId: process.env.CLOUDFRONT_DISTRIBUTION,
        Id: data.Invalidation.Id,
      };

      cloudFront.waitFor("invalidationCompleted", params).promise().then(next);
    })
    .catch(next);
};

// Remove GeoTiff
export const removeTiff = (req, res, next) => {
  res.locals.filename = `${req.params.imagery}.tif`;
  res.locals.dir = "imagery";
  req.query.path = [
    `/imagery/${req.params.imagery}/*`,
    `/combo/${req.params.imagery}/*`,
    `/combo/issues/${req.params.imagery}/*`,
    `/combo/marker/${req.params.imagery}/*`,
  ];

  removeFile(req, res, next);
};

// Remove Shapefile
export const removeShape = (req, res, next) => {
  res.locals.filename = `${req.params.custom}.zip`;
  res.locals.dir = "custom";
  req.query.path = [`/custom/${req.params.custom}/*`];

  removeFile(req, res, next);
};
