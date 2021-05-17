import express from "express";
import {
  validateImagery,
  validateCustom,
  validateBucket,
  validateWait,
  validatePath,
  validateKey,
} from "../middlewares/validators";
import { cacheResponse, invalidate } from "../middlewares/cache";
import { setDefaultBucket, respond, noCache } from "../middlewares/tools";

const router = express.Router();

router
  .get("/imagery/:imagery", validateBucket, validateImagery, validateWait, invalidate, cacheResponse, noCache, respond)
  .get(
    "/custom/:custom",
    setDefaultBucket(process.env.CUSTOM_LAYERS_REGION, process.env.CUSTOM_LAYERS_BUCKET),
    validateBucket,
    validateCustom,
    validateWait,
    invalidate,
    cacheResponse,
    noCache,
    respond
  )
  .get("/invalidate", validateKey, validatePath, validateWait, invalidate, cacheResponse, noCache, respond);

export default router;
