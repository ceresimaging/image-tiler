import express from 'express';

import { createMap, vectorResponse, respond } from '../middlewares/map';
import { validateTile, validateImagery } from '../middlewares/validators';
import { fieldLayer } from '../middlewares/field';

const router = express.Router();

router
  .get('/:imagery/:z/:x/:y.mvt',
    validateTile,
    validateImagery,
    createMap,
    fieldLayer,
    vectorResponse,
    respond
  );

export default router;
