import express from "express";

import {
  createMap,
  rasterResponse,
  setExtent,
  vectorResponse,
} from "../middlewares/mapnik";
import {
  validateTile,
  validateSize,
  validateOverlay,
  validateColor,
  validateVarietal,
  validateMissing,
} from "../middlewares/validators";
import { treeDataLayer, treeCountLayer } from "../middlewares/tree";
import { respond, setDefaultSize, zoomBox } from "../middlewares/tools";

const router = express.Router();

router
  .get(
    "/count/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateMissing,
    validateVarietal,
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
    createMap,
    treeCountLayer,
    setExtent,
    rasterResponse,
    respond
  )
  .get(
    "/data/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateColor,
    validateVarietal,
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
    createMap,
    treeDataLayer,
    setExtent,
    rasterResponse,
    respond
  );

export default router;
