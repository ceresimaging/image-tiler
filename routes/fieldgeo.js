import express from "express";

import {
  createMap,
  rasterResponse,
  setExtent,
  vectorResponse,
} from "../middlewares/mapnik";
import {
  validateTile,
  validateFarm,
  validateField,
  validateSize,
  validateBuffer,
} from "../middlewares/validators";
import { fieldLayer } from "../middlewares/fieldgeo";
import { respond, setDefaultSize, zoomBox } from "../middlewares/tools";

const router = express.Router();

router
  .get(
    "/:farm/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateFarm,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  )
  .get(
    "/:farm/:field/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateFarm,
    validateField,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  )
  .get(
    "/:farm/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateFarm,
    createMap,
    fieldLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/:farm.png",
    setDefaultSize(1024),
    validateSize,
    validateBuffer,
    validateFarm,
    createMap,
    fieldLayer,
    setExtent,
    rasterResponse,
    respond
  )
  .get(
    "/:farm/:field/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateFarm,
    validateField,
    createMap,
    fieldLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/:farm/:field.png",
    setDefaultSize(1024),
    validateSize,
    validateBuffer,
    validateFarm,
    validateField,
    createMap,
    fieldLayer,
    setExtent,
    rasterResponse,
    respond
  );

export default router;
