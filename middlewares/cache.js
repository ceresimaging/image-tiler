import fs from "fs";
import AWS from "aws-sdk";

const cloudFront = new AWS.CloudFront();

// Set response data
export const cacheResponse = (req, res, next) => {
  const { invalidations = [] } = res.locals;

  res.locals.data = {
    invalidations: invalidations.length,
  };

  res.set("Content-Type", "application/json");

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
  req.query.path = [`/custom/${req.params.custom}/*`];

  removeFile(req, res, next);
};
