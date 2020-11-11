import express from 'express';

import { createMap, vectorResponse } from '../middlewares/mapnik';
import { validateTile, validateSize, validateOverlay } from '../middlewares/validators';
import { treeDataLayer, treeCountLayer } from '../middlewares/tree';
import { respond } from '../middlewares/tools';

const router = express.Router();

router
  .get('/count/:overlay/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateOverlay,
    createMap,
    treeCountLayer,
    vectorResponse,
    respond
  )
  .get('/data/:overlay/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateOverlay,
    createMap,
    treeDataLayer,
    vectorResponse,
    respond
  );

export default router;
