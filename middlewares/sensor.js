import mapnik from "mapnik";

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildQuery = ({ customer, readings }) => {
  return `(
    SELECT
      d.id,
      d.location AS geom,
      d.customer_id,
      d.field_id,
      d.vendor_device_id AS name,
      s.type,
      s.subtype,
      s.unit AS unit_type,
      to_json(array(
        SELECT json_build_object('read_time', read_time, 'value', value)
        FROM sensor_readings
        WHERE device_id = d.id 
          AND deleted IS NULL
        ORDER BY read_time DESC
        LIMIT ${readings}
      ))::text AS readings
    FROM sensor_devices d
    JOIN device_designs s ON s.id = d.design_id
    WHERE d.customer_id = ${customer}
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
  const { readings } = req.query;
  const { map } = res.locals;

  const layer = new mapnik.Layer("sensors");
  layer.datasource = await buildDataSource(buildQuery, { customer, readings });
  map.add_layer(layer);

  next();
};
