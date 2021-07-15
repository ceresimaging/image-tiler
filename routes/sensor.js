import express from "express";

import { createMap, vectorResponse } from "../middlewares/mapnik";
import { validateTile, validateSize, validateCustomer, validateReadings } from "../middlewares/validators";
import { sensorLayer } from "../middlewares/sensor";
import { respond } from "../middlewares/tools";

const router = express.Router();

router.get(
  "/:customer/:z/:x/:y.mvt",
  validateTile,
  validateSize,
  validateCustomer,
  validateReadings,
  createMap,
  sensorLayer,
  vectorResponse,
  respond
);

export default router;
