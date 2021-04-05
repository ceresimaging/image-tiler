#!/bin/bash

url="postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST:$CORE_DB_PORT/$CORE_DB_NAME"

tables=(
  customers_geo customers_farm customers_oldfarm customers_cropvarietal customers_cropdetail
  published_imagery_displayfield published_imagery_overlay published_imagery_overlaytype
  trees trees_data
  visits flights markers
  auth_user platform_auth_ceresuserprofile
)

sequences=(
  '"fields_Field_ID_seq"'
  '"flights_Flight_ID_seq"'
  '"visits_Visit_ID_seq"'
)

list="${sequences[@]/#/-t } ${tables[@]/#/-t }"

extra_lines="^\(GRANT\|REVOKE\|SET\|--\|^$\)"

echo "Dumping database structure..."
pg_dump $url -O -s --section=pre-data $list | grep -v $extra_lines > test/fixtures/dump.sql
echo "Creating temporal tables with sample data..."

# Fields to transplant before running this script: 55994, 56481

psql $url \
  -c "
    CREATE TABLE tmp_trees AS (
      SELECT *
      FROM trees
      WHERE overlay_id IN (
        '4d5cca2a-5b18-4346-90af-8daa2bcbfc1e',
        '041cfc7f-fd9e-4dc5-bf91-0d3775dcce1b'
      )
    );
    CREATE TABLE tmp_trees_data AS (
      SELECT *
      FROM trees_data
      WHERE overlay_id = '98e1c50d-1d6e-40ac-b955-2c8ab5df07cb'
        AND tree_id IN (SELECT id FROM tmp_trees)
    );
    CREATE TABLE tmp_customers_cropvarietal AS (
      SELECT *
      FROM customers_cropvarietal
      WHERE id IN (SELECT DISTINCT varietal_id FROM tmp_trees)
    );
    CREATE TABLE tmp_customers_cropdetail AS (
      SELECT *
      FROM customers_cropdetail
      WHERE id IN (SELECT DISTINCT crop_detail_id FROM tmp_customers_cropvarietal)
    );
    CREATE TABLE tmp_published_imagery_overlay AS (
      SELECT *
      FROM published_imagery_overlay
      WHERE id IN (SELECT DISTINCT overlay_id FROM tmp_trees_data)
        OR id IN (SELECT DISTINCT overlay_id FROM tmp_trees)
    );
    CREATE TABLE tmp_published_imagery_overlaytype AS (
      SELECT *
      FROM published_imagery_overlaytype
      WHERE id IN (SELECT DISTINCT overlay_type_id FROM tmp_published_imagery_overlay)
    );
    CREATE TABLE tmp_visits AS (
      SELECT *
      FROM visits
      WHERE id IN (122950, 191225, 210560, 210555, 122948, 128587)
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
    CREATE TABLE tmp_platform_auth_ceresuserprofile AS (
      SELECT *
      FROM platform_auth_ceresuserprofile
      WHERE user_id IN (SELECT DISTINCT id FROM tmp_auth_user)
    );
  "

list=${tables[@]/#/-t tmp_}

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