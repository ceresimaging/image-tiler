import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildTreeCountQuery = (overlay) => {
  return `(
    SELECT
      t.id::text tree_id,
      t.geometry geom,
      t.plant_date::text,
      t.remove_date::text,
      v.name varietal,
      v.is_pollinator pollinator,
      NOT t.is_present missing,
      v.color color
    FROM trees t
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    WHERE t.overlay_id = '${overlay}'
      AND t.deleted is NULL
    ORDER BY t.id
  ) AS trees`;
};

const buildTreeDataQuery = (overlay) => {
  return `(
    SELECT
      t.id::text tree_id,
      t.geometry AS geom,
      v.name varietal,
      td.value,
      td.color
    FROM trees_data td
    JOIN trees t ON t.id = td.tree_id
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    WHERE t.overlay_id = '${overlay}'
      AND t.deleted is NULL
    ORDER BY t.id
  ) AS trees`;
};

const buildDataSource = (queryBuilder, overlay) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: queryBuilder(overlay),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  });
};

export const treeCountLayer = (req, res, next) => {
  const { overlay } = req.params;
  const { map } = res.locals;

  const trees = new mapnik.Layer('trees');
  trees.datasource = buildDataSource(buildTreeCountQuery, overlay);
  map.add_layer(trees);

  next();
};

export const treeDataLayer = (req, res, next) => {
  const { overlay } = req.params;
  const { map } = res.locals;

  const trees = new mapnik.Layer('trees');
  trees.datasource = buildDataSource(buildTreeDataQuery, overlay);
  map.add_layer(trees);

  next();
};
