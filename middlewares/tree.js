import mapnik from "mapnik";
import fs from "fs";
import pg from "pg";
import { logTiming, NotFoundError } from "./tools";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

// Read stylesheet file
const dataStyle = fs.readFileSync("styles/tree.xml", "utf8");

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

const buildTreeCountQuery = ({ overlay, missing, varietal, marker }) => {
  return `(
    SELECT
      id,
      geom,
      varietal_name varietal,
      crop_name,
      crop_group,
      pollinator,
      missing,
      color
    FROM "${overlay}"
    WHERE missing = ${missing}
      ${varietal.length ? `AND varietal_name IN ('${varietal.join("','")}')` : ""}
      ${marker ? `AND ST_DWithin(geom, '${marker}'::geography, 0)` : ""}
  ) AS trees`;
};

const buildTreeDataQuery = ({ overlay, color, varietal, marker }) => {
  return `(
    SELECT
      tree_id,
      geom,
      varietal_name varietal,
      crop_name,
      crop_group,
      value,
      color
    FROM "${overlay}"
    WHERE true
      ${color.length ? `AND color IN ('${color.join("','")}')` : ""}
      ${varietal.length ? `AND varietal_name IN ('${varietal.join("','")}')` : ""}
      ${marker ? `AND ST_DWithin(geom, '${marker}'::geography, 0)` : ""}
  ) AS trees`;
};

const calculateExtent = async (overlay) => {
  const query = `
    SELECT (ST_XMin(ext) || ',' || ST_YMin(ext) || ',' || ST_XMax(ext) || ',' || ST_YMax(ext)) AS extent
    FROM (
      SELECT ST_Extent(cg.geometry) AS ext
      FROM customers_geo cg
      JOIN customers_farm f ON f.id = cg.farm_id
      JOIN visits v ON v.field_id = f.id
      JOIN published_imagery_overlay o ON o.visit_id = v.id
      WHERE o.id = '${overlay}'
    ) AS tmp;
  `;

  return (await pool.query(query)).rows[0].extent;
};

const getMarkerGeometry = async (marker) => {
  const query = `
    SELECT geometry
    FROM markers
    WHERE id = '${marker}'
  `;

  return (await pool.query(query)).rows[0].geometry;
};

const buildDataSource = async (queryBuilder, filters) => {
  const extent = await calculateExtent(filters.overlay);

  if (!extent) return;

  if (filters.marker) {
    filters.marker = await getMarkerGeometry(filters.marker);
  }

  return new mapnik.Datasource({
    type: "postgis",
    host: process.env.PLI_DB_HOST,
    port: process.env.PLI_DB_PORT,
    user: process.env.PLI_DB_USER,
    password: process.env.PLI_DB_PASS,
    dbname: process.env.PLI_DB_NAME,
    table: queryBuilder(filters),
    extent: extent,
    geometry_field: "geom",
    srid: 4326,
    initial_size: process.env.PLI_DB_MIN || 1,
    max_size: process.env.PLI_DB_MAX || 10,
    connect_timeout: process.env.PLI_DB_TIMEOUT || 4,
    persist_connection: false,
  });
};

export const treeCountLayer = async (req, res, next) => {
  next = logTiming("treeCountLayer", res, next);

  const { overlay } = req.params;
  const { missing, varietal, marker } = req.query;
  const { map } = res.locals;

  let datasource;

  try {
    datasource = await buildDataSource(buildTreeCountQuery, {
      overlay,
      missing,
      varietal,
      marker,
    });
  } catch (error) {
    return next(error);
  }

  if (!datasource) return next(NotFoundError);

  map.fromStringSync(dataStyle);
  const trees = new mapnik.Layer("trees");
  trees.datasource = datasource;
  trees.styles = ["tree"];
  map.add_layer(trees);

  next();
};

export const treeDataLayer = async (req, res, next) => {
  next = logTiming("treeDataLayer", res, next);

  const { overlay } = req.params;
  const { color, varietal, marker } = req.query;
  const { map } = res.locals;

  let datasource;

  try {
    datasource = await buildDataSource(buildTreeDataQuery, {
      overlay,
      color,
      varietal,
      marker,
    });
  } catch (error) {
    return next(error);
  }

  if (!datasource) return next(NotFoundError);

  map.fromStringSync(dataStyle);
  const trees = new mapnik.Layer("trees");
  trees.datasource = datasource;
  trees.styles = ["tree"];
  map.add_layer(trees);

  next();
};

export const calculateTreeBuffer = (req, res, next) => {
  next = logTiming("calculateTreeBuffer", res, next);

  const { overlay } = req.params;

  const query = `
    SELECT avg(distance) AS distance
    FROM (
      SELECT min(ST_Distance(t1.geom, t2.geom)) AS distance
      FROM (
        SELECT t.id, t.geom
        FROM "${overlay}" t
        ORDER BY t.id
        LIMIT 10
      ) t1, "${overlay}" t2
      WHERE t1.id <> t2.id 
        AND ST_DWithin(t1.geom, t2.geom, 10)
      GROUP BY t1.id
    ) subquery
  `;

  pool
    .query(query)
    .then((result) => {
      if (!result.rows[0].distance) return next(NotFoundError);
      res.locals.treeBuffer = result.rows[0].distance * 0.5;
      next();
    })
    .catch((error) => {
      // Error 42P01 means table does not exist
      // Probably because it was not transplanted or the overlay provided is wrong
      if (error.code === "42P01") return next(NotFoundError);
      next(error);
    });
};
