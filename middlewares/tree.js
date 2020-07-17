import mapnik from 'mapnik';

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildTreeQuery = (field) => {
  return `(
    SELECT
      t.id::text tree_id,
      df.id::text AS field_id,
      t.geometry AS geom,
      t.plant_date,
      t.remove_date,
      v.id::text varietal_id,
      v.name varietal
    FROM trees t
    LEFT JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN published_imagery_displayfield df ON df.source_field_id = t.field_id
    WHERE df.id = '${field}'
      AND t.deleted is NULL 
      AND t.is_present = true
  ) AS trees`;
};

const buildMissingQuery = (field) => {
  return `(
    SELECT
      t.id::text tree_id,
      df.id::text AS field_id,
      t.geometry AS geom,
      t.plant_date,
      t.remove_date,
      v.id::text varietal_id,
      v.name varietal
    FROM trees t
    LEFT JOIN customers_cropvarietal v ON v.id = t.varietal_id
    JOIN published_imagery_displayfield df ON df.source_field_id = t.field_id
    WHERE df.id = '${field}'
      AND t.deleted is NULL 
      AND t.is_present = false
  ) AS trees`;
};

const buildDataSource = (field, queryBuilder) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: queryBuilder(field),
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
  trees.datasource = buildDataSource(field, buildTreeQuery);
  map.add_layer(trees);

  const missing = new mapnik.Layer('missing');
  missing.datasource = buildDataSource(field, buildMissingQuery);
  map.add_layer(missing);

  next();
};
