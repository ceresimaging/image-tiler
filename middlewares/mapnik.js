import mapnik from 'mapnik';

// Generate PNG
export const rasterResponse = (req, res, next) => {
  const { map } = res.locals;

  map.render(
    new mapnik.Image(map.width, map.height),
    (renderError, tile) => {
      if (renderError) return next(renderError);

      tile.encode('png', (dataError, data) => {
        if (dataError) return next(dataError);

        res.locals.data = data;

        res.set('Content-Type', 'image/png');

        next();
      });
    }
  );
};

// Generate Vector Tile
export const vectorResponse = (req, res, next) => {
  const { map } = res.locals;
  const { x, y, z } = req.params;

  map.render(
    new mapnik.VectorTile(z, x, y),
    (renderError, tile) => {
      if (renderError) return next(renderError);

      tile.getData((dataError, data) => {
        if (dataError) return next(dataError);

        res.locals.data = data;

        res.set('Content-Type', 'application/x-protobuf');

        next();
      });
    }
  );
};

// Create Mapnik Map
export const createMap = (req, res, next) => {
  const { size, ratio } = req.query;

  const map = new mapnik.Map(size, size * ratio, '+init=epsg:3857');

  res.locals.map = map;

  next();
};

// Define map extent based on current layers and buffer
export const setExtent = (req, res, next) => {
  const { buffer, minBuffer } = req.query;
  const { map } = res.locals;

  // Zoom to current layers
  map.zoomAll();

  // Add buffer
  if (buffer !== 0) {
    map.bufferSize = map.width * buffer;
    map.zoomToBox(map.bufferedExtent);
  }

  // Add minBuffer if buffer is not enough
  if (minBuffer !== 0) {
    const extent = map.extent;

    if ((extent[2] - extent[0]) < minBuffer) {
      extent[0] -= minBuffer;
      extent[2] += minBuffer;
    }

    if ((extent[3] - extent[1]) < minBuffer) {
      extent[1] -= minBuffer;
      extent[3] += minBuffer;
    }

    map.extent = extent;
  }

  next();
};
