import express from 'express';

import { createMap, vectorResponse } from '../middlewares/mapnik';
import { validateTile, validateSize, validateField, validateVisit, validateOverlay } from '../middlewares/validators';
import { treeDataLayer, treeLayer } from '../middlewares/tree';
import { respond } from '../middlewares/tools';

const router = express.Router();

router
  .get('/:field/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateField,
    createMap,
    treeLayer,
    vectorResponse,
    respond
  )
  .get('/:field/:visit/:overlay/:z/:x/:y.mvt',
    validateTile,
    validateSize,
    validateField,
    validateVisit,
    validateOverlay,
    createMap,
    treeDataLayer,
    vectorResponse,
    respond
  );

export default router;
