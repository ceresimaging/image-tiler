import mapnik from "mapnik";
import fs from "fs";

// Load fonts (This layer has labels)
mapnik.register_default_fonts();

// Read stylesheet files
const markerNumberStyle = fs.readFileSync("styles/marker-number.xml", "utf8");
const markerHoleStyle = fs.readFileSync("styles/marker-hole.xml", "utf8");
const markerIssueStyle = fs.readFileSync("styles/marker-issue.xml", "utf8");

// Load Mapnik datasource
mapnik.registerDatasource(`${mapnik.settings.paths.input_plugins}/postgis.input`);

const buildVisitQuery = (visit, user = null, onlyInternal = false) => {
  return `(
    SELECT m.id AS id,
      m.geometry AS geom,
      m.type AS category,
      ROW_NUMBER() OVER (ORDER BY m.created_at) AS number
    FROM markers m
    JOIN auth_user as u
      ON m.created_by_id = u.id
    JOIN visits v
      ON m.visit_id = v.id
    WHERE m.deleted is null
      AND m.is_open = true
      AND (
        m.visit_id = ${visit}
        OR (
          m.visit_id IN (
            SELECT v2.id
            FROM visits v1
            JOIN visits v2 ON v2.field_id = v1.field_id
            WHERE v1.id = ${visit}
          )
          AND (
            m.start_date IS NULL
            OR m.start_date <= (
              SELECT date
              FROM flights f
              JOIN visits v3 ON v3.flight_id = f.id
              WHERE v3.id = ${visit}
            )
          )
          AND (
            m.end_date IS NULL
            OR m.end_date >= (
              SELECT date
              FROM flights f
              JOIN visits v3 ON v3.flight_id = f.id
              WHERE v3.id = ${visit}
            )
          )
        )
      )
      ${user ? "AND m.staff_only = false" : ""}
      ${onlyInternal ? "AND extra_data->>('marker_template') IS NOT NULL" : ""}
    ORDER BY m.created_at
  ) AS markers`;
};

const buildMarkerQuery = (marker) => {
  return `(
    SELECT m.id AS id,
      m.geometry AS geom,
      m.type AS category
    FROM markers m
    WHERE m.id = '${marker}'
  ) AS markers`;
};

const buildDataSource = (query) => {
  return new mapnik.Datasource({
    type: "postgis",
    host: process.env.CORE_DB_HOST,
    port: process.env.CORE_DB_PORT,
    user: process.env.CORE_DB_USER,
    password: process.env.CORE_DB_PASS,
    dbname: process.env.CORE_DB_NAME,
    table: query,
    extent_from_subquery: true,
    geometry_field: "geom",
    srid: 4326,
    max_size: 10,
    connect_timeout: 30,
  });
};

const markerLayer = (res, next, style, query) => {
  const { map } = res.locals;

  map.fromStringSync(style);

  const layer = new mapnik.Layer("markers");

  layer.datasource = buildDataSource(query);

  layer.styles = ["marker-icon"];

  // Add layer if contains at least 1 feature
  if (layer.datasource.extent()[0] !== Number.MAX_VALUE) {
    map.add_layer(layer);
  }

  next();
};

export const issueMarkersLayer = (req, res, next) => {
  markerLayer(res, next, markerIssueStyle, buildVisitQuery(req.params.visit, null, true));
};

export const visitMarkersLayer = (req, res, next) => {
  markerLayer(res, next, markerNumberStyle, buildVisitQuery(req.params.visit, req.query.user));
};

export const singleMarkerLayer = (req, res, next) => {
  markerLayer(res, next, markerHoleStyle, buildMarkerQuery(req.params.marker));
};
