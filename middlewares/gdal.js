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

  const query = `
    SELECT avg(distance) AS distance
    FROM (
      SELECT min(ST_Distance(t1.geometry, t2.geometry)) AS distance
      FROM (
        SELECT t.id, t.overlay_id, t.geometry
        FROM trees t
        JOIN trees_data td ON td.tree_id = t.id
        WHERE td.overlay_id = '${overlay}'
        ORDER BY t.id
        LIMIT 10
      ) t1, trees t2
      WHERE t1.id <> t2.id 
        AND t1.overlay_id = t2.overlay_id
        AND ST_DWithin(t1.geometry, t2.geometry, 0.0001)
      GROUP BY t1.id
    ) subquery
  `;

  pool
    .query(query)
    .then((result) => {
      const conn = `dbname='${process.env.CORE_DB_NAME}' host='${process.env.CORE_DB_HOST}' port='${process.env.CORE_DB_PORT}' user='${process.env.CORE_DB_USER}' password='${process.env.CORE_DB_PASS}'`;

      const resX = 0.0000056;
      const resY = -0.0000045;
      const buffer = result.rows[0].distance * 0.5;

      const query = `SELECT ST_Buffer(t.geometry, ${buffer}), ('x'||substr(td.color,2,2))::bit(8)::int r, ('x'||substr(td.color,4,2))::bit(8)::int g, ('x'||substr(td.color,6,2))::bit(8)::int b FROM trees_data td JOIN trees t ON t.id = td.tree_id WHERE td.overlay_id = '${overlay}'`;

      const name = `/tmp/${Date.now()}${Math.random()}`;

      const cmd = `${process.cwd()}/render/pli2tif ${name} ${overlay} ${resX} ${resY} "${query}" "${conn}"`;

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
