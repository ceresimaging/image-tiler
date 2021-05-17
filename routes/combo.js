import express from "express";

import { zoomBox, setDefaultSize, setDefaultRatio, setDefaultBuffer, respond, noCache } from "../middlewares/tools";
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
  validateVarietal,
} from "../middlewares/validators";
import { satelliteLayer } from "../middlewares/satellite";
import { imageryLayer } from "../middlewares/imagery";
import { treeDataLayer } from "../middlewares/tree";
import { visitMarkersLayer, issueMarkersLayer, singleMarkerLayer } from "../middlewares/marker";

const router = express.Router();

router
  .get(
    "/tree/data/:overlay/:visit.png",
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
    visitMarkersLayer,
    rasterResponseExt,
    noCache,
    respond
  )
  .get(
    "/:imagery/:z/:x/:y.png",
    validateTile,
    validateSize,
    validateImagery,
    validateBucket,
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
    createMap,
    imageryLayer,
    setExtent,
    satelliteLayer,
    visitMarkersLayer,
    rasterResponseExt,
    noCache,
    respond
  )
  .get(
    "/issues/:imagery/:visit.png",
    setDefaultSize(256),
    setDefaultRatio(0.5),
    setDefaultBuffer([0, 0.15, 0, 0.5], [50, 50, 50, 90]),
    validateImagery,
    validateVisit,
    validateSize,
    validateBuffer,
    validateBucket,
    createMap,
    issueMarkersLayer,
    setExtent,
    imageryLayer,
    setExtent,
    satelliteLayer,
    rasterResponse,
    respond
  )
  .get(
    "/issues/tree/data/:overlay/:visit.png",
    setDefaultSize(256),
    setDefaultRatio(0.5),
    setDefaultBuffer([0, 0.15, 0, 0.5], [50, 50, 50, 90]),
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
    issueMarkersLayer,
    rasterResponse,
    noCache,
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
    createMap,
    singleMarkerLayer,
    setExtent,
    imageryLayer,
    rasterResponse,
    respond
  )
  .get(
    "/marker/tree/data/:overlay/:marker.png",
    setDefaultSize(256),
    setDefaultRatio(0.65),
    setDefaultBuffer([0, 0.15, 0, 0.5], [50, 50, 50, 90]),
    validateMarker,
    validateOverlay,
    validateSize,
    validateBuffer,
    validateColor,
    validateVarietal,
    createMap,
    singleMarkerLayer,
    setExtent,
    treeDataLayer,
    rasterResponse,
    noCache,
    respond
  );

export default router;
