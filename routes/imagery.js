import express from "express";

import { zoomBox, autocropImage, setDefaultSize, respond } from "../middlewares/tools";
import { createMap, rasterResponse, setExtent } from "../middlewares/mapnik";
import { validateTile, validateImagery, validateSize, validateBucket } from "../middlewares/validators";
import { imageryLayer } from "../middlewares/imagery";
import { downloadTiff } from "../middlewares/download";

const router = express.Router();

router
  .get(
    "/:imagery/:z/:x/:y.png",
    validateTile,
    validateImagery,
    validateSize,
    validateBucket,
    downloadTiff,
    createMap,
    imageryLayer,
    zoomBox,
    rasterResponse,
    respond
  )
  .get(
    "/:imagery.png",
    setDefaultSize(1024),
    validateImagery,
    validateSize,
    validateBucket,
    downloadTiff,
    createMap,
    imageryLayer,
    setExtent,
    rasterResponse,
    autocropImage,
    respond
  );

export default router;
