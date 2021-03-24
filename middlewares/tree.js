import mapnik from "mapnik";
import fs from "fs";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

// Read stylesheet file
const dataStyle = fs.readFileSync("styles/tree.xml", "utf8");

const buildTreeCountQuery = ({ overlay, missing, varietal }) => {
  return `(
    SELECT
      t.id::text tree_id,
      t.geometry geom,
      v.name varietal,
      v.is_pollinator pollinator,
      NOT t.is_present missing,
      v.color color
    FROM trees t
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    WHERE t.overlay_id = '${overlay}'
      ${missing ? `AND t.is_present <> ${missing}` : ""}
      ${varietal.length ? `AND v.name IN ('${varietal.join("','")}')` : ""}
    ORDER BY t.id
  ) AS trees`;
};

const buildTreeDataQuery = ({ overlay, color, varietal }) => {
  return `(
    SELECT
      t.id::text tree_id,
      t.geometry geom,
      v.name varietal,
      cd.name crop_name,
      cd.group crop_group,
      td.value,
      td.color
    FROM trees_data td
    JOIN trees t ON t.id = td.tree_id
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN customers_cropdetail cd ON cd.id = v.crop_detail_id
    WHERE td.overlay_id = '${overlay}'
      ${color.length ? `AND td.color IN ('${color.join("','")}')` : ""}
      ${varietal.length ? `AND v.name IN ('${varietal.join("','")}')` : ""}
    ORDER BY td.value, t.id
  ) AS trees`;
};

const buildDataSource = (queryBuilder, filters) => {
  return new mapnik.Datasource({
    type: "postgis",
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: queryBuilder(filters),
    extent_from_subquery: true,
    geometry_field: "geom",
    srid: 4326,
    max_size: 10,
    connect_timeout: 30,
  });
};

export const treeCountLayer = (req, res, next) => {
  const { overlay } = req.params;
  const { missing, varietal } = req.query;
  const { map } = res.locals;

  map.fromStringSync(dataStyle);

  const trees = new mapnik.Layer("trees");
  trees.datasource = buildDataSource(buildTreeCountQuery, {
    overlay,
    missing,
    varietal,
  });
  trees.styles = ["tree"];
  map.add_layer(trees);

  next();
};

export const treeDataLayer = (req, res, next) => {
  const { overlay } = req.params;
  const { color, varietal } = req.query;
  const { map } = res.locals;

  map.fromStringSync(dataStyle);

  const trees = new mapnik.Layer("trees");
  trees.datasource = buildDataSource(buildTreeDataQuery, {
    overlay,
    color,
    varietal,
  });
  trees.styles = ["tree"];
  map.add_layer(trees);

  next();
};
