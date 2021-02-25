import express from "express";

import {
  zoomBox,
  setDefaultSize,
  setDefaultRatio,
  setDefaultBuffer,
  setDefaultUser,
  respond,
  noCache,
} from "../middlewares/tools";
import { createMap, rasterResponse, rasterResponseExt, setExtent } from "../middlewares/mapnik";
import {
  validateTile,
  validateImagery,
  validateSize,
  validateBuffer,
  validateBucket,
  validateMarker,
  validateVisit,
  validateOverlay,
  validateColor,
  validateVarietal
} from "../middlewares/validators";
import { satelliteLayer } from "../middlewares/satellite";
import { imageryLayer } from "../middlewares/imagery";
import { treeDataLayer } from "../middlewares/tree";
import { markerLayer } from "../middlewares/marker";
import { downloadTiff } from "../middlewares/download";

const router = express.Router();

router
  .get(
    "/:imagery/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateImagery,
    validateBucket,
    downloadTiff,
    createMap,
    imageryLayer,
    satelliteLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/:imagery.png",
    setDefaultSize(1024),
    setDefaultBuffer(0.1, 100),
    validateImagery,
    validateSize,
    validateBuffer,
    validateBucket,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    satelliteLayer,
    rasterResponse,
    respond
  )
  .get(
    "/:imagery/:visit.png",
    setDefaultSize(1024),
    setDefaultBuffer(0.1, 100),
    validateImagery,
    validateVisit,
    validateSize,
    validateBuffer,
    validateBucket,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    satelliteLayer,
    markerLayer,
    rasterResponseExt,
    noCache,
    respond
  )
  .get(
    "/pli/:overlay/:visit.png",
    setDefaultSize(1024),
    setDefaultBuffer(0.1, 100),
    validateOverlay,
    validateVisit,
    validateSize,
    validateBuffer,
    validateColor,
    validateVarietal,
    createMap,
    treeDataLayer,
    setExtent,
    satelliteLayer,
    markerLayer,
    rasterResponseExt,
    noCache,
    respond
  )
  .get(
    "/issues/:imagery/:visit.png",
    setDefaultSize(256),
    setDefaultRatio(0.5),
    setDefaultBuffer([0, 0.15, 0, 0.5], [50, 50, 50, 90]),
    setDefaultUser(process.env.SUPPORT_USER),
    validateImagery,
    validateVisit,
    validateSize,
    validateBuffer,
    validateBucket,
    downloadTiff,
    createMap,
    markerLayer,
    setExtent,
    imageryLayer,
    setExtent,
    satelliteLayer,
    rasterResponse,
    respond
  )
  .get(
    "/marker/:imagery/:marker.png",
    setDefaultSize(256),
    setDefaultRatio(0.65),
    setDefaultBuffer([0, 0.15, 0, 0.5], [50, 50, 50, 90]),
    validateMarker,
    validateImagery,
    validateBuffer,
    validateSize,
    validateBucket,
    downloadTiff,
    createMap,
    markerLayer,
    setExtent,
    imageryLayer,
    setExtent,
    rasterResponse,
    respond
  );

export default router;
