import SphericalMercator from "@mapbox/sphericalmercator";
import sharp from "sharp";

const mercator = new SphericalMercator();

// Respond request
export const respond = (req, res, next) => {
  // Set cache age to 90 days
  res.set("Cache-Control", res.locals.cache || "max-age=7776000");

  // Send data
  res.send(res.locals.data);
};

// Set no-cache header
export const noCache = (req, res, next) => {
  res.locals.cache = "no-store,no-cache";
  next();
};

// Autocrop image
export const autocropImage = (req, res, next) => {
  sharp(res.locals.data)
    .trim()
    .toBuffer()
    .then((data) => {
      res.locals.data = data;
      next();
    })
    .catch(next);
};

// Convert tile XYZ to BBOX
export const zoomBox = (req, res, next) => {
  const { x, y, z } = req.params;

  res.locals.map.zoomToBox(mercator.bbox(x, y, z, false, "900913"));

  next();
};

// Generate Vector Tile from PostGIS
export const vectorPGResponse = (req, res, next) => {
  res.set("Content-Type", "application/x-protobuf");
  next();
};

// Set image size
export const setDefaultSize = (size) => {
  return (req, res, next) => {
    req.query.size = req.query.size || `${size}`;
    next();
  };
};

// Set image aspect ratio
export const setDefaultRatio = (ratio) => {
  return (req, res, next) => {
    req.query.ratio = req.query.ratio || `${ratio}`;
    next();
  };
};

// Set buffer
export const setDefaultBuffer = (buffer, minBuffer) => {
  return (req, res, next) => {
    req.query.buffer = req.query.buffer || (Array.isArray(buffer) ? buffer : `${buffer}`);
    req.query.minBuffer = req.query.minBuffer || (Array.isArray(minBuffer) ? minBuffer : `${minBuffer}`);
    next();
  };
};

// Set user
export const setDefaultUser = (user) => {
  return (req, res, next) => {
    req.query.user = req.query.user || `${user}`;
    next();
  };
};

// Set S3 bucket
export const setDefaultBucket = (bucket) => {
  return (req, res, next) => {
    req.query.bucket = req.query.bucket || `${bucket}`;
    next();
  };
};

// Set age limit in days
export const setDefaultAge = (age) => {
  return (req, res, next) => {
    req.query.age = req.query.age || `${age}`;
    next();
  };
};
