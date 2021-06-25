import express from "express";

import { createMap, vectorResponse } from "../middlewares/mapnik";
import { validateTile, validateSize, validateCustomer } from "../middlewares/validators";
import { sensorLayer } from "../middlewares/sensor";
import { respond } from "../middlewares/tools";

const router = express.Router();

router.get(
  "/:customer/:z/:x/:y.mvt",
  validateTile,
  validateSize,
  validateCustomer,
  createMap,
  sensorLayer,
  vectorResponse,
  respond
);

export default router;
