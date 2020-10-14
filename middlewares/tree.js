import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildTreeQuery = (field) => {
  return `(
    SELECT
      t.id::text tree_id,
      df.id::text field_id,
      t.geometry geom,
      t.plant_date::text,
      t.remove_date::text,
      v.name varietal,
      v.is_pollinator pollinator,
      NOT t.is_present missing
    FROM trees t
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN published_imagery_displayfield df ON df.source_field_id = t.field_id
    WHERE df.id = '${field}'
      AND t.deleted is NULL
    ORDER BY t.id
  ) AS trees`;
};

const buildTreeDataQuery = (field, visit, overlay) => {
  return `(
    SELECT
      td.tree_id::text,
      df.id::text field_id,
      td.visit_id,
      f.date::text flight_date,
      o.name AS overlay,
      t.geometry AS geom,
      v.name varietal,
      td.value,
      td.color
    FROM trees_data td
    JOIN trees t ON t.id = td.tree_id
    JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN published_imagery_displayfield df ON df.source_field_id = t.field_id
    JOIN published_imagery_overlaytype o ON o.id = td.overlay_type_id
    JOIN visits vs ON vs.id = td.visit_id
    JOIN flights f ON f.id = vs.flight_id
    WHERE df.id = '${field}'
      AND td.visit_id = '${visit}'
      AND o.name = '${overlay}'
    ORDER BY t.id
    ) AS trees_data`;
};

const buildDataSource = (queryBuilder, params) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: queryBuilder(...params),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  });
};

export const treeLayer = (req, res, next) => {
  const { field } = req.params;
  const { map } = res.locals;

  const trees = new mapnik.Layer('trees');
  trees.datasource = buildDataSource(buildTreeQuery, [field]);
  map.add_layer(trees);

  next();
};

export const treeDataLayer = (req, res, next) => {
  const { field, visit, overlay } = req.params;
  const { map } = res.locals;

  const trees = new mapnik.Layer('trees_data');
  trees.datasource = buildDataSource(buildTreeDataQuery, [field, visit, overlay]);
  map.add_layer(trees);

  next();
};
