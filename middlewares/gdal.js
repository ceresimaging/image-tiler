import fs from "fs";
import { exec } from "child_process";
import { logTiming } from "./tools";

// Generate TIF with GDAL
export const generateTif = (req, res, next) => {
  next = logTiming("generateTif", res, next);

  const { overlay } = req.params;
  const { treeBuffer } = res.locals;

  const conn = `dbname='${process.env.PLI_DB_NAME}' host='${process.env.PLI_DB_HOST}' port='${process.env.PLI_DB_PORT}' user='${process.env.PLI_DB_USER}' password='${process.env.PLI_DB_PASS}'`;

  const resX = 0.0000056;
  const resY = -0.0000045;

  const query = `
    SELECT ST_Buffer(geom, ${treeBuffer}), 
      ('x'||substr(color,2,2))::bit(8)::int r, 
      ('x'||substr(color,4,2))::bit(8)::int g, 
      ('x'||substr(color,6,2))::bit(8)::int b 
    FROM \\"${overlay}\\"
  `;

  const name = `/tmp/${Date.now()}${Math.random()}`;

  const cmd = `${process.cwd()}/render/pli2tif ${name} ${overlay} ${resX} ${resY} "${query}" "${conn}"`;

  exec(cmd, (error) => {
    if (error) return next(error);
    try {
      res.locals.data = fs.readFileSync(name);
      next();
      fs.unlinkSync(name);
    } catch (error) {
      next(error);
    }
  });
};

// Set response headers
export const tifResponse = (req, res, next) => {
  const { overlay } = req.params;

  res.set("Content-Type", "image/tiff");

  next();
};
