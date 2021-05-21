import validator from "validator";

class ValidationError extends Error {
  constructor(message, type) {
    super(`Bad param format: ${message}. ${type} expected.`);

    this.name = "ValidationError";
    this.code = 400;
  }
}

class BufferError extends ValidationError {
  constructor(buffer) {
    super(`Buffer: ${buffer}`, "Float or Float[4] (0-1)");
  }
}

class MinBufferError extends ValidationError {
  constructor(minBuffer) {
    super(`Minimum Buffer: ${minBuffer}`, "Int or Int[4]");
  }
}

// Validate tile parameters
export const validateTile = (req, res, next) => {
  if (validator.isInt(req.params.x) && validator.isInt(req.params.y) && validator.isInt(req.params.z)) {
    req.params.x = parseInt(req.params.x);
    req.params.y = parseInt(req.params.y);
    req.params.z = parseInt(req.params.z);

    return next();
  }

  throw new ValidationError(`ZXY = ${req.params.z}/${req.params.x}/${req.params.y}`, "Int/Int/Int");
};

// Validate Imagery imagery parameter
export const validateImagery = (req, res, next) => {
  if (validator.isUUID(req.params.imagery)) {
    return next();
  }

  throw new ValidationError(`Imagery ID: ${req.params.imagery}`, "UUID");
};

// Validate Field parameter
export const validateField = (req, res, next) => {
  if (validator.isUUID(req.params.field)) {
    return next();
  }

  throw new ValidationError(`Field ID: ${req.params.field}`, "UUID");
};

// Validate Farm parameter
export const validateFarm = (req, res, next) => {
  if (validator.isUUID(req.params.farm)) {
    return next();
  }

  throw new ValidationError(`Farm ID: ${req.params.farm}`, "UUID");
};

// Validate Marker parameter
export const validateMarker = (req, res, next) => {
  if (validator.isUUID(req.params.marker)) {
    return next();
  }

  throw new ValidationError(`Marker ID: ${req.params.marker}`, "UUID");
};

// Validate Custom Layer parameter
export const validateCustom = (req, res, next) => {
  if (validator.isUUID(req.params.custom)) {
    return next();
  }

  throw new ValidationError(`Custom Layer ID: ${req.params.custom}`, "UUID");
};

// Validate Size and Ratio query
export const validateSize = (req, res, next) => {
  if (!req.query.size || validator.isInt(req.query.size)) {
    req.query.size = parseInt(req.query.size || 256);
  } else {
    throw new ValidationError(`Size: ${req.query.size}`, "Int");
  }

  if (!req.query.ratio || validator.isFloat(req.query.ratio)) {
    req.query.ratio = parseFloat(req.query.ratio || 1);
    return next();
  }

  throw new ValidationError(`Aspect Ratio: ${req.query.ratio}`, "Float");
};

// Validate Buffer and MinBuffer query
export const validateBuffer = (req, res, next) => {
  if (Array.isArray(req.query.buffer)) {
    if (req.query.buffer.length !== 4) throw new BufferError(req.query.buffer);
    req.query.buffer = req.query.buffer.map(parseFloat);
    if (req.query.buffer.some(isNaN)) throw new BufferError(req.query.buffer);
  } else if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    req.query.buffer = Array(4).fill(parseFloat(req.query.buffer || 0));
  } else {
    throw new BufferError(req.query.buffer);
  }

  if (Array.isArray(req.query.minBuffer)) {
    if (req.query.minBuffer.length !== 4) throw new MinBufferError(req.query.minBuffer);
    req.query.minBuffer = req.query.minBuffer.map((v) => parseInt(v));
    if (req.query.minBuffer.some(isNaN)) throw new MinBufferError(req.query.minBuffer);
  } else if (!req.query.minBuffer || validator.isInt(req.query.minBuffer)) {
    req.query.minBuffer = Array(4).fill(parseInt(req.query.minBuffer || 0));
  } else {
    throw new MinBufferError(req.query.minBuffer);
  }

  next();
};

// Validate S3 Bucket
export const validateBucket = (req, res, next) => {
  if (!req.query.bucket || typeof req.query.bucket == "string") {
    req.query.bucket = req.query.bucket || process.env.IMAGERY_BUCKET;
    return next();
  }

  throw new ValidationError(`Bucket: ${req.query.bucket}`, "String");
};

// Validate wait
export const validateWait = (req, res, next) => {
  if (!req.query.wait || validator.isBoolean(req.query.wait)) {
    req.query.wait = validator.toBoolean(req.query.wait || "false");
    return next();
  }

  throw new ValidationError(`Wait: ${req.query.wait}`, "Boolean");
};

// Validate path
export const validatePath = (req, res, next) => {
  if (!req.query.path) {
    req.query.path = ["/*"];
  } else {
    req.query.path = Array.isArray(req.query.path) ? req.query.path : [req.query.path];

    if (req.query.path.some((path) => !validator.matches(path, /^\/(?:.*)\*$/))) {
      throw new ValidationError(`Path: ${req.query.path}`, "String|Array[String]");
    }
  }

  return next();
};

// Validate flush key
export const validateKey = (req, res, next) => {
  if (req.query.key === process.env.CLOUDFRONT_DISTRIBUTION) {
    return next();
  }

  throw new ValidationError(`Key: ${req.query.key}`, "String");
};

// Validate Visit
export const validateVisit = (req, res, next) => {
  if (req.params.visit && validator.isInt(req.params.visit)) {
    req.params.visit = parseInt(req.params.visit);
    return next();
  }

  throw new ValidationError(`Visit ID: ${req.params.visit}`, "Int");
};

// Validate Overlay
export const validateOverlay = (req, res, next) => {
  if (validator.isUUID(req.params.overlay)) {
    return next();
  }

  throw new ValidationError(`Overlay ID: ${req.params.overlay}`, "UUID");
};

// Validate Color
export const validateColor = (req, res, next) => {
  if (!req.query.color) {
    req.query.color = [];
  } else {
    req.query.color = Array.isArray(req.query.color) ? req.query.color : [req.query.color];

    if (req.query.color.some((color) => !validator.isHexColor(color))) {
      throw new ValidationError(`Color: ${req.query.color}`, "HexColor|Array[HexColor]");
    }
  }

  return next();
};

// Validate Varietal
export const validateVarietal = (req, res, next) => {
  if (!req.query.varietal) {
    req.query.varietal = [];
  } else {
    req.query.varietal = Array.isArray(req.query.varietal) ? req.query.varietal : [req.query.varietal];

    if (req.query.varietal.some((varietal) => validator.isEmpty(varietal))) {
      throw new ValidationError(`Varietal: ${req.query.varietal}`, "String|Array[String]");
    }
  }

  return next();
};

// Validate Missing
export const validateMissing = (req, res, next) => {
  if (!req.query.missing || validator.isBoolean(req.query.missing)) {
    req.query.missing = validator.toBoolean(req.query.missing || "false");
    return next();
  }

  throw new ValidationError(`Missing: ${req.query.missing}`, "Boolean");
};
