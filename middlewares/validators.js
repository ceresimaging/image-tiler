import validator from 'validator';

class ValidationError extends Error {
  constructor (message, type) {
    super(`Bad param format: ${message}. ${type} expected.`);

    this.name = 'ValidationError';
    this.code = 400;
  }
}

// Validate tile parameters
export const validateTile = (req, res, next) => {
  if (validator.isInt(req.params.x) &&
    validator.isInt(req.params.y) &&
    validator.isInt(req.params.z)) {
    req.params.x = parseInt(req.params.x);
    req.params.y = parseInt(req.params.y);
    req.params.z = parseInt(req.params.z);

    return next();
  }

  throw new ValidationError(`ZXY = ${req.params.z}/${req.params.x}/${req.params.y}`, 'Int/Int/Int');
};

// Validate Imagery imagery parameter
export const validateImagery = (req, res, next) => {
  if (validator.isUUID(req.params.imagery)) {
    return next();
  }

  throw new ValidationError(`Imagery ID: ${req.params.imagery}`, 'UUID');
};

// Validate Flight imagery parameter
export const validateFlight = (req, res, next) => {
  if (validator.isUUID(req.params.flight)) {
    return next();
  }

  throw new ValidationError(`Flight ID: ${req.params.flight}`, 'UUID');
};

// Validate Field parameter
export const validateField = (req, res, next) => {
  if (validator.isUUID(req.params.field)) {
    return next();
  }

  throw new ValidationError(`Field ID: ${req.params.field}`, 'UUID');
};

// Validate Farm parameter
export const validateFarm = (req, res, next) => {
  if (validator.isUUID(req.params.farm)) {
    return next();
  }

  throw new ValidationError(`Farm ID: ${req.params.farm}`, 'UUID');
};

// Validate Custom Layer parameter
export const validateCustom = (req, res, next) => {
  if (validator.isUUID(req.params.custom)) {
    return next();
  }

  throw new ValidationError(`Custom Layer ID: ${req.params.custom}`, 'UUID');
};

// Validate Size and Ratio query
export const validateSize = (req, res, next) => {
  if (!req.query.size || validator.isInt(req.query.size)) {
    req.query.size = parseInt(req.query.size || 256);
  } else {
    throw new ValidationError(`Size: ${req.query.size}`, 'Int');
  }

  if (!req.query.ratio || validator.isFloat(req.query.ratio)) {
    req.query.ratio = parseFloat(req.query.ratio || 1);
    return next();
  }

  throw new ValidationError(`Aspect Ratio: ${req.query.ratio}`, 'Float');
};

// Validate Buffer and MinBuffer query
export const validateBuffer = (req, res, next) => {
  if (!req.query.buffer || validator.isFloat(req.query.buffer, { min: 0, max: 1 })) {
    req.query.buffer = parseFloat(req.query.buffer || 0);
  } else {
    throw new ValidationError(`Buffer: ${req.query.buffer}`, 'Float (0-1)');
  }

  if (!req.query.minBuffer || validator.isInt(req.query.minBuffer)) {
    req.query.minBuffer = parseFloat(req.query.minBuffer || 0);
    return next();
  }

  throw new ValidationError(`Minimum Buffer: ${req.query.minBuffer}`, 'Int');
};

// Validate cache limit age
export const validateAge = (req, res, next) => {
  if (!req.query.age || validator.isInt(req.query.age)) {
    req.query.age = parseInt(req.query.age || 10);
    return next();
  }

  throw new ValidationError(`Cache Limit Age: ${req.query.age}`, 'Int');
};

// Validate S3 Region and Bucket
export const validateBucket = (req, res, next) => {
  if (!req.query.region || !validator.isEmpty(req.query.region)) {
    req.query.region = req.query.region || process.env.IMAGERY_REGION;
  } else {
    throw new ValidationError(`Region: ${req.query.region}`, 'String');
  }

  if (!req.query.bucket || !validator.isEmpty(req.query.bucket)) {
    req.query.bucket = req.query.bucket || process.env.IMAGERY_BUCKET;
    return next();
  }

  throw new ValidationError(`Bucket: ${req.query.bucket}`, 'String');
};

// Validate wait
export const validateWait = (req, res, next) => {
  if (!req.query.wait || validator.isBoolean(req.query.wait)) {
    req.query.wait = validator.toBoolean(req.query.wait || 'false');
    return next();
  }

  throw new ValidationError(`Wait: ${req.query.wait}`, 'Boolean');
};

// Validate path
export const validatePath = (req, res, next) => {
  if (!req.query.path || validator.matches(req.query.path, /^\/(?:.*)\*$/)) {
    req.query.path = req.query.path || '/*';
    return next();
  }

  throw new ValidationError(`Path: ${req.query.path}`, 'String (/[path]/*, /*)');
};
