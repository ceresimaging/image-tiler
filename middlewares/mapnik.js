import mapnik from "mapnik";
import fs from "fs";
import { exec } from "child_process";
import { logTiming } from "./tools";

// Resize Map based on resolution
export const autoScale = (req, res, next) => {
  const { map } = res.locals;

  map.resize(map.width * map.scale(), map.height * map.scale());

  next();
};

// Generate PNG
export const rasterResponse = (req, res, next) => {
  next = logTiming("rasterResponse", res, next);

  const { map } = res.locals;

  map.render(new mapnik.Image(map.width, map.height), (renderError, tile) => {
    if (renderError) return next(renderError);

    tile.encode("png", (dataError, data) => {
      if (dataError) return next(dataError);

      res.locals.data = data;

      res.set("Content-Type", "image/png");

      next();
    });
  });
};

// Generate PNG with external renderer
export const rasterResponseExt = (req, res, next) => {
  next = logTiming("rasterResponseExt", res, next);

  const { map } = res.locals;

  const name = `/tmp/${Date.now()}${Math.random()}`;
  const xml = `${name}.xml`;
  const png = `${name}.png`;

  // External render uses the maximum extent instead of the extent <(ò_ó)>
  map.maximumExtent = map.extent;

  fs.writeFileSync(xml, map.toXML());

  const cmd = `${process.cwd()}/render/render ${xml} ${png} ${map.width} ${map.height}`;

  exec(cmd, (error) => {
    if (error) return next(error);

    res.locals.data = fs.readFileSync(`${png}`);

    res.set("Content-Type", "image/png");

    next();

    fs.unlinkSync(xml);
    fs.unlinkSync(png);
  });
};

// Generate Vector Tile
export const vectorResponse = (req, res, next) => {
  next = logTiming("vectorResponse", res, next);

  const { map } = res.locals;
  const { x, y, z } = req.params;

  map.render(new mapnik.VectorTile(z, x, y), (renderError, tile) => {
    if (renderError) return next(renderError);

    tile.getData((dataError, data) => {
      if (dataError) return next(dataError);

      res.locals.data = data;

      res.set("Content-Type", "application/x-protobuf");

      next();
    });
  });
};

// Create Mapnik Map
export const createMap = (req, res, next) => {
  const { size, ratio } = req.query;

  const map = new mapnik.Map(size, size * ratio, "+init=epsg:3857");

  res.locals.map = map;

  next();
};

// Define map extent based on current layers and buffer
export const setExtent = (req, res, next) => {
  next = logTiming("setExtent", res, next);

  const { buffer, minBuffer } = req.query;
  const { map } = res.locals;

  // If there are not layers, continue
  if (!map.layers().length) return next();

  // If extent is already set, continue
  if (map.extent[0] !== Number.MAX_VALUE) return next();

  // Zoom to current layers
  map.zoomAll();

  // If there's no buffer to add, continue
  if (!buffer) return next();

  // Calculate buffer
  // Left/Right use map width, Top/Bottom use height
  // If buffer is not enough, minBuffer is applied
  const bufferSize = buffer.map((b, i) => {
    let bufferSize = ([0, 2].includes(i) ? map.width : map.height) * b * map.scale();
    if (bufferSize < minBuffer[i]) {
      bufferSize = minBuffer[i];
    }
    return bufferSize;
  });

  const extent = map.extent;

  extent[0] -= bufferSize[0];
  extent[2] += bufferSize[2];
  extent[1] -= bufferSize[1];
  extent[3] += bufferSize[3];

  map.extent = extent;

  next();
};
