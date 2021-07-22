#!/bin/bash

# Overlays to transplant before running this script: 
# 4d5cca2a-5b18-4346-90af-8daa2bcbfc1e (Field: 55994)
# 041cfc7f-fd9e-4dc5-bf91-0d3775dcce1b (Field: 56481)

url="postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST:$CORE_DB_PORT/$CORE_DB_NAME"

tables=(
  customers_geo customers_farm customers_oldfarm
  published_imagery_displayfield published_imagery_overlay published_imagery_overlaytype
  visits flights markers
  auth_user
)

sequences=(
  '"fields_Field_ID_seq"'
  '"flights_Flight_ID_seq"'
  '"visits_Visit_ID_seq"'
)

pli_overlays=(
  '"4d5cca2a-5b18-4346-90af-8daa2bcbfc1e"' 
  '"041cfc7f-fd9e-4dc5-bf91-0d3775dcce1b"' 
  '"98e1c50d-1d6e-40ac-b955-2c8ab5df07cb"'
)

pli_overlays_list=$(echo ${pli_overlays[@]} | sed "s/\ /\,/g" | sed "s/\"/'/g")

list="${sequences[@]/#/-t } ${tables[@]/#/-t } ${pli_overlays[@]/#/-t }"

extra_lines="^\(GRANT\|REVOKE\|SET\|--\|^$\)"

echo "Dumping database structure..."
pg_dump $url -O -s --section=pre-data $list | grep -v $extra_lines > test/fixtures/dump.sql

echo "Creating temporal tables with sample data..."
psql $url \
  -c "
    CREATE TABLE tmp_published_imagery_overlay AS (
      SELECT *
      FROM published_imagery_overlay
      WHERE id IN ($pli_overlays_list)
    );
    CREATE TABLE tmp_published_imagery_overlaytype AS (
      SELECT *
      FROM published_imagery_overlaytype
      WHERE id IN (SELECT DISTINCT overlay_type_id FROM tmp_published_imagery_overlay)
    );
    CREATE TABLE tmp_visits AS (
      SELECT *
      FROM visits
      WHERE id IN (122950, 191225, 210560, 210555, 122948, 128587, 237721, 268329)
        OR id IN (SELECT DISTINCT visit_id FROM tmp_published_imagery_overlay
      )
    );
    CREATE TABLE tmp_customers_oldfarm AS (
      SELECT *
      FROM customers_oldfarm
      WHERE id = '7355293c-e23d-4aab-8ff0-e2f8f1b83f4e'
    );
    CREATE TABLE tmp_customers_farm AS (
      SELECT *
      FROM customers_farm
      WHERE farm_id = (SELECT id FROM tmp_customers_oldfarm)
        OR id IN (SELECT DISTINCT field_id FROM tmp_visits)
    );
    CREATE TABLE tmp_published_imagery_displayfield AS (
      SELECT *
      FROM published_imagery_displayfield
      WHERE source_field_id = 55994
        OR source_field_id IN (SELECT id FROM tmp_customers_farm)
    );
    CREATE TABLE tmp_customers_geo AS (
      SELECT *
      FROM customers_geo
      WHERE farm_id IN (SELECT DISTINCT source_field_id FROM tmp_published_imagery_displayfield)
        OR farm_id IN (SELECT id FROM tmp_customers_farm)
    );
    CREATE TABLE tmp_markers AS (
      SELECT *
      FROM markers
      WHERE visit_id IN (SELECT DISTINCT id FROM tmp_visits)
    );
    INSERT INTO tmp_markers
      (id, created_at, geometry, source, staff_only, is_open, description, type, created_by_id, visit_id)
    VALUES
      (
        '236c3733-08f5-428c-ba49-7a611c83b75b',
        '2019-08-15 20:15:29.339571+00',
        ST_GeomFromEWKT('SRID=4326;POLYGON((-122.309646 38.519419,-122.308733 38.521266,-122.307608 38.519506,-122.309646 38.519419))'),
        'avian',
        false,
        true,
        'Draft Marker',
        'draft',
        16,
        128587
      );
    CREATE TABLE tmp_flights AS (
      SELECT *
      FROM flights
      WHERE id IN (SELECT DISTINCT flight_id FROM tmp_visits)
    );
    CREATE TABLE tmp_auth_user AS (
      SELECT *
      FROM auth_user
      WHERE id IN (SELECT DISTINCT created_by_id FROM tmp_markers)
    );
  "

list="${tables[@]/#/-t tmp_} ${pli_overlays[@]/#/-t}"

echo "Dumping database data..."
pg_dump $url -O -a $list | sed 's/public.tmp_/public./' | grep -v $extra_lines >> test/fixtures/dump.sql

list=(${tables[@]/%/;})
list=${list[@]/#/DROP TABLE IF EXISTS tmp_}

echo "Dropping temporal tables..."
psql $url -c "$list"

##################################################

url="postgres://$EXTRA_DB_USER:$EXTRA_DB_PASS@$EXTRA_DB_HOST:$EXTRA_DB_PORT/$EXTRA_DB_NAME"

echo "Dumping gssurgo database structure..."
pg_dump $url -O -s --section=pre-data -t $EXTRA_DB_TABLE | grep -v $extra_lines >> test/fixtures/dump.sql

echo "Dumping gssurgo database data..."
query="SELECT * FROM $EXTRA_DB_TABLE WHERE geom && ST_MakeEnvelope(-119.17, 35.56, -119.15, 35.58, 4326)"
echo "COPY public.gssurgo (id, areasymbol, mukey, musym, muname, aws0100wta, drclassdcd, geom) FROM stdin;" >> test/fixtures/dump.sql
psql $url -c "COPY ($query) TO STDOUT" | grep -v $extra_lines >> test/fixtures/dump.sql
echo "\." >> test/fixtures/dump.sql