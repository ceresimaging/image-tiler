import fs from "fs";
import { exec } from "child_process";
import pg from "pg";

// PG connection pool
const { Pool } = pg;
const pool = new Pool({
  user: process.env.CORE_DB_USER,
  host: process.env.CORE_DB_HOST,
  database: process.env.CORE_DB_NAME,
  password: process.env.CORE_DB_PASS,
  port: process.env.CORE_DB_PORT,
  max: process.env.CORE_DB_MAX || 50,
});

// Generate TIF with GDAL
export const tifResponse = (req, res, next) => {
  const { overlay } = req.params;

  const bufferQuery = `
    SELECT avg(distance) AS distance
    FROM (
      SELECT ST_Distance(t1.geometry, t2.geometry) AS distance
      FROM trees t1
      JOIN trees t2 ON ST_DWithin(t1.geometry, t2.geometry, 0.0001)
      JOIN trees_data td ON td.tree_id = t1.id
      WHERE td.overlay_id = '${overlay}'
    ) AS query
    WHERE distance > 0;
  `;

  pool
    .query(bufferQuery)
    .then((result) => {
      const conn = `dbname='${process.env.CORE_DB_NAME}' host='${process.env.CORE_DB_HOST}' port='${process.env.CORE_DB_PORT}' user='${process.env.CORE_DB_USER}' password='${process.env.CORE_DB_PASS}'`;

      const resX = 0.000005;
      const resY = -0.000004;
      const buffer = result.rows[0].distance * 0.25;

      const queryR = `SELECT ST_Buffer(t.geometry, ${buffer}), ('x'||substr(td.color,2,2))::bit(8)::int r FROM trees_data td JOIN trees t ON t.id = td.tree_id WHERE td.overlay_id = '${overlay}'`;
      const queryG = `SELECT ST_Buffer(t.geometry, ${buffer}), ('x'||substr(td.color,4,2))::bit(8)::int g FROM trees_data td JOIN trees t ON t.id = td.tree_id WHERE td.overlay_id = '${overlay}'`;
      const queryB = `SELECT ST_Buffer(t.geometry, ${buffer}), ('x'||substr(td.color,6,2))::bit(8)::int b FROM trees_data td JOIN trees t ON t.id = td.tree_id WHERE td.overlay_id = '${overlay}'`;

      const name = `/tmp/${Date.now()}${Math.random()}`;

      const cmd = `${process.cwd()}/render/pli2tif ${name} ${overlay} ${resX} ${resY} "${queryR}" "${queryG}" "${queryB}" "${conn}"`;

      exec(cmd, (error) => {
        if (error) return next(error);

        res.locals.data = fs.readFileSync(name);

        res.set("Content-Type", "image/tiff");
        res.set("Content-disposition", `attachment; filename=${overlay}.tif`);

        next();

        fs.unlinkSync(name);
      });
    })
    .catch(next);
};
