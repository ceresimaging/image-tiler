import mapnik from 'mapnik';
import fs from 'fs';

// Load fonts (This layer has labels)
mapnik.register_default_fonts();

// Read stylesheet file
const style = fs.readFileSync('styles/marker.xml', 'utf8');
const issueStyle = fs.readFileSync('styles/marker-issue.xml', 'utf8');

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildQuery = (imagery, flight, user, exclusive) => {
  let userFilter = '';

  if (user) {
    if (exclusive) {
      userFilter = `AND cup.id = '${user}'`;
    } else {
      userFilter = `
        AND m.staff_only = false
        AND cup.id = '${user}'
      `;
    }
  }

  return `(
    SELECT m.id AS id,
      m.geometry AS geom,
      m.type AS category,
      ROW_NUMBER() OVER () AS number
    FROM markers m
    JOIN auth_user as u 
      ON m.created_by_id = u.id
    JOIN platform_auth_ceresuserprofile cup
      ON u.id = cup.user_id
    JOIN visits v 
      ON m.visit_id = v.id
    JOIN published_imagery_flight pif
      ON v.id = pif.visit_id
    WHERE ST_GeometryType(m.geometry) = 'ST_Point'
      AND m.deleted is null 
      AND m.is_open = true
      AND (
        pif.id = '${flight}'
        OR (
          pif.id IN (
            SELECT pfl2.id
            FROM published_imagery_imageryoverlay pio
            JOIN published_imagery_flight pfl
              ON pfl.id = pio.flight_id
            JOIN published_imagery_displayfield pdf
              ON pdf.id = pfl.field_id
            JOIN published_imagery_flight pfl2
              ON pfl2.field_id = pdf.id
            WHERE pio.geotiff_url LIKE '%${imagery}%'
          )
          AND (
            m.start_date IS NULL
            OR m.start_date <= (
              SELECT date
              FROM published_imagery_flight
              WHERE id = '${flight}'
            )
          )
          AND (
            m.end_date IS NULL
            OR m.end_date >= (
              SELECT date
              FROM published_imagery_flight
              WHERE id = '${flight}'
            )
          )
        )
      )
      ${userFilter}
    ORDER BY m.created_at
  ) AS markers`;
};

const buildMarkerQuery = (marker) => {
  return `(
    SELECT m.id AS id,
      m.geometry AS geom,
      m.type AS category,
      ROW_NUMBER() OVER () AS number
    FROM markers m
    WHERE m.id = '${marker}'
  ) AS markers`;
};

const buildDataSource = (query) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: query,
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  });
};

export const markerLayer = (req, res, next) => {
  const { flight, imagery, marker } = req.params;
  const { user } = req.query;
  const { map } = res.locals;
  const { exclusive = false } = req.query;

  if (user === process.env.SUPPORT_USER) {
    map.fromStringSync(issueStyle);
  } else {
    map.fromStringSync(style);
  }

  const layer = new mapnik.Layer('markers');

  if (flight) {
    layer.datasource = buildDataSource(buildQuery(imagery, flight, user, exclusive));
  } else {
    layer.datasource = buildDataSource(buildMarkerQuery(marker));
  }
  layer.styles = ['marker-icon'];

  // Add layer if contains at least 1 feature
  if (layer.datasource.extent()[0] !== Number.MAX_VALUE) {
    map.add_layer(layer);
  }

  next();
};
