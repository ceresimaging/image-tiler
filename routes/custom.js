import express from "express";

import { setDefaultBucket, respond } from "../middlewares/tools";
import { createMap, vectorResponse } from "../middlewares/mapnik";
import { validateTile, validateSize, validateCustom, validateBucket } from "../middlewares/validators";
import { customLayer } from "../middlewares/custom";

const router = express.Router();

router.get(
  "/:custom/:z/:x/:y.mvt",
  setDefaultBucket(process.env.CUSTOM_LAYERS_BUCKET),
  validateTile,
  validateSize,
  validateCustom,
  validateBucket,
  createMap,
  customLayer,
  vectorResponse,
  respond
);

export default router;
