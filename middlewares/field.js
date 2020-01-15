import mapnik from 'mapnik'

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`)

const buildQuery = (imagery) => {
  return `(
    SELECT piu.id AS id,
      SUM(auto_acres) AS acres,
      ST_Collect(geometry) AS geom
    FROM customers_geo cg
    JOIN published_imagery_displayfield piu
      ON piu.source_field_id = cg.farm_id
    WHERE piu.id = '${imagery}'
    GROUP BY piu.id
  ) AS fields`
}

const buildDataSource = (imagery) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(imagery),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  })
}

export const fieldLayer = (req, res, next) => {
  const { map } = res.locals
  const { imagery } = req.params

  const layer = new mapnik.Layer('fields')

  layer.datasource = buildDataSource(imagery)

  map.add_layer(layer)

  next()
}