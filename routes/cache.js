import express from "express";
import {
  validateAge,
  validateImagery,
  validateCustom,
  validateBucket,
  validateWait,
  validatePath,
  validateKey,
} from "../middlewares/validators";
import {
  flush,
  removeTiff,
  removeShape,
  cacheResponse,
  invalidate,
} from "../middlewares/cache";
import { setDefaultBucket, respond, noCache } from "../middlewares/tools";

const router = express.Router();

router
  .get("/", validateKey, validateAge, flush, noCache, cacheResponse, respond)
  .get(
    "/imagery/:imagery",
    validateBucket,
    validateImagery,
    validateWait,
    removeTiff,
    invalidate,
    cacheResponse,
    noCache,
    respond
  )
  .get(
    "/custom/:custom",
    setDefaultBucket(
      process.env.CUSTOM_LAYERS_REGION,
      process.env.CUSTOM_LAYERS_BUCKET
    ),
    validateBucket,
    validateCustom,
    validateWait,
    removeShape,
    invalidate,
    cacheResponse,
    noCache,
    respond
  )
  .get(
    "/invalidate",
    validateKey,
    validatePath,
    validateWait,
    invalidate,
    cacheResponse,
    noCache,
    respond
  );

export default router;
