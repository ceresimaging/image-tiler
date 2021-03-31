import express from "express";

import { createMap, rasterResponse, rasterResponseExt, setExtent, vectorResponse } from "../middlewares/mapnik";
import {
  validateTile,
  validateSize,
  validateOverlay,
  validateColor,
  validateVarietal,
  validateMissing,
} from "../middlewares/validators";
import { treeDataLayer, treeCountLayer, treeDataPGLayer, treeCountPGLayer } from "../middlewares/tree";
import { respond, vectorPGResponse, setDefaultSize, zoomBox } from "../middlewares/tools";

const router = express.Router();

router
  // .get(
  //   "/count/:overlay/:z/:x/:y.mvt",
  //   validateTile,
  //   validateSize,
  //   validateOverlay,
  //   validateMissing,
  //   validateVarietal,
  //   createMap,
  //   treeCountLayer,
  //   vectorResponse,
  //   respond
  // )
  .get(
    "/count/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateMissing,
    validateVarietal,
    treeCountPGLayer,
    vectorPGResponse,
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
    rasterResponseExt,
    respond
  )
  // .get(
  //   "/data/:overlay/:z/:x/:y.mvt",
  //   validateTile,
  //   validateSize,
  //   validateOverlay,
  //   validateColor,
  //   validateVarietal,
  //   createMap,
  //   treeDataLayer,
  //   vectorResponse,
  //   respond
  // )
  .get(
    "/data/:overlay/:z/:x/:y.mvt",
    validateTile,
    validateSize,
    validateOverlay,
    validateColor,
    validateVarietal,
    treeDataPGLayer,
    vectorPGResponse,
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
    rasterResponseExt,
    respond
  );

export default router;
