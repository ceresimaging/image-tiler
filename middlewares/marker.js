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
      userFilter = `AND dwf.user_profile_id = '${user}'`;
    } else {
      userFilter = `
        AND dwf.is_staff = false
        AND dwf.user_profile_id = '${user}'
      `;
    }
  }

  return `(
    SELECT dwf.id AS id,
      ptf.feature AS geom,
      dwf.marker_category AS category,
      dwf.marker_type AS type,
      ROW_NUMBER() OVER () AS number
    FROM published_imagery_drawingfeature dwf
    JOIN published_imagery_pointfeature ptf
      ON ptf.drawingfeature_ptr_id = dwf.id
    JOIN published_imagery_flight pif
      ON pif.id = dwf.flight_id
    WHERE dwf.type = 'Point'
      AND dwf.deleted = false
      AND dwf.is_open = true
      AND (
        dwf.flight_id = '${flight}'
        OR (
          dwf.flight_id IN (
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
          AND dwf.flight_only = false
          AND (
            dwf.start_date IS NULL OR dwf.start_date <= pif.date
          )
          AND (
            dwf.end_date IS NULL OR dwf.start_date >= pif.date
          )
        )
      )
      ${userFilter}
    ORDER BY dwf.date_created
  ) AS markers`;
};

const buildDataSource = (imagery, flight, user, exclusive) => {
  return new mapnik.Datasource({
    type: 'postgis',
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: buildQuery(imagery, flight, user, exclusive),
    extent_from_subquery: true,
    geometry_field: 'geom',
    srid: 4326,
    max_size: 10,
    connect_timeout: 30
  });
};

export const markerLayer = (req, res, next) => {
  const { flight, imagery } = req.params;
  const { user } = req.query;
  const { map } = res.locals;
  const { exclusive = false } = req.query;

  if (user === process.env.SUPPORT_USER) {
    map.fromStringSync(issueStyle);
  } else {
    map.fromStringSync(style);
  }

  const layer = new mapnik.Layer('markers');

  layer.datasource = buildDataSource(imagery, flight, user, exclusive);
  layer.styles = ['marker-icon'];

  map.add_layer(layer);

  next();
};
