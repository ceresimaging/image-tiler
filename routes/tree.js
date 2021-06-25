import express from "express";

import { createMap, rasterResponse, rasterResponseExt, setExtent, vectorResponse } from "../middlewares/mapnik";
import {
  validateTile,
  validateSize,
  validateOverlay,
  validateColor,
  validateVarietal,
  validateMissing,
  validateMarkerQuery,
} from "../middlewares/validators";
import { treeDataLayer, treeCountLayer, calculateTreeBuffer } from "../middlewares/tree";
import { respond, setDefaultSize, zoomBox } from "../middlewares/tools";
import { generateTif, tifResponse } from "../middlewares/gdal";

const router = express.Router();

router
  .get(
    "/count/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateMissing,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeCountLayer,
    vectorResponse,
    respond
  )
  .get(
    "/count/:overlay/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateOverlay,
    validateMissing,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeCountLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/count/:overlay.png",
    setDefaultSize(1024),
    validateSize,
    validateOverlay,
    validateMissing,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeCountLayer,
    setExtent,
    rasterResponseExt,
    respond
  )
  .get(
    "/data/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateColor,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeDataLayer,
    vectorResponse,
    respond
  )
  .get(
    "/data/:overlay/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateOverlay,
    validateColor,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeDataLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/data/:overlay.png",
    setDefaultSize(1024),
    validateSize,
    validateOverlay,
    validateColor,
    validateVarietal,
    validateMarkerQuery,
    createMap,
    treeDataLayer,
    setExtent,
    rasterResponseExt,
    respond
  )
  .get("/data/:overlay.tif", validateOverlay, calculateTreeBuffer, generateTif, tifResponse, respond);

export default router;
