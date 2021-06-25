import mapnik from "mapnik";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildQuery = ({ customer }) => {
  return `(
    SELECT
      d.id,
      d.geometry geom,
      d.customer_id,
      d.field_id,
      r.read_time::text,
      r.value
    FROM sensor_devices d 
    LEFT JOIN (
      SELECT device_id, read_time, value
      FROM sensor_readings
      WHERE deleted IS NULL
      ORDER BY read_time DESC
      LIMIT 1
    ) r ON r.device_id = d.id
    WHERE d.customer_id = '${customer}'
      AND d.deleted IS NULL
  ) AS sensors`;
};

const buildDataSource = async (queryBuilder, filters) => {
  return new mapnik.Datasource({
    type: "postgis",
    host: process.env.SENSOR_DB_HOST,
    port: process.env.SENSOR_DB_PORT,
    user: process.env.SENSOR_DB_USER,
    password: process.env.SENSOR_DB_PASS,
    dbname: process.env.SENSOR_DB_NAME,
    table: queryBuilder(filters),
    geometry_field: "geom",
    extent_from_subquery: true,
    srid: 4326,
    initial_size: process.env.SENSOR_DB_MIN || 1,
    max_size: process.env.SENSOR_DB_MAX || 10,
    connect_timeout: process.env.SENSOR_DB_TIMEOUT || 4,
    persist_connection: false,
  });
};

export const sensorLayer = async (req, res, next) => {
  const { customer } = req.params;
  const { map } = res.locals;

  const layer = new mapnik.Layer("sensors");
  layer.datasource = await buildDataSource(buildQuery, { customer });
  map.add_layer(layer);

  next();
};
