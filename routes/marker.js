import express from 'express';

import { createMap, vectorResponse, rasterResponse } from '../middlewares/mapnik';
import { validateTile, validateSize, validateVisit } from '../middlewares/validators';
import { zoomBox, respond } from '../middlewares/tools';
import { markerLayer } from '../middlewares/marker';

const router = express.Router();

router
  .get('/:visit/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateVisit,
    createMap,
    markerLayer,
    vectorResponse,
    respond
  )
  .get('/:visit/:z/:x/:y.png',
    validateTile,
    validateSize,
    validateVisit,
    createMap,
    markerLayer,
    zoomBox,
    rasterResponse,
    respond
  );

export default router;
