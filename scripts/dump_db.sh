#!/bin/bash

url="postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST:$CORE_DB_PORT/$CORE_DB_NAME"

tables=(
  customers_geo customers_farm customers_oldfarm customers_cropvarietal 
  published_imagery_displayfield published_imagery_overlaytype published_imagery_flight
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

echo "Dumping database structure..."
pg_dump $url -O -s --section=pre-data $list > test/fixtures/dump.sql

echo "Creating temporal tables with sample data..."
psql $url \
  -c "
    CREATE TABLE tmp_trees AS (
      SELECT * 
      FROM trees 
      WHERE field_id = 55994 
        AND deleted IS NULL
    );
    CREATE TABLE tmp_trees_data AS (
      SELECT * 
      FROM trees_data
      WHERE visit_id = 230675 
        AND overlay_type_id = 12
        AND tree_id IN (SELECT id FROM tmp_trees)
    );
    CREATE TABLE tmp_customers_cropvarietal AS (
      SELECT * 
      FROM customers_cropvarietal
      WHERE id IN (SELECT DISTINCT varietal_id FROM tmp_trees)
    );
    CREATE TABLE tmp_visits AS (
      SELECT * 
      FROM visits
      WHERE id IN (SELECT DISTINCT visit_id FROM tmp_trees_data)
    );
    CREATE TABLE tmp_published_imagery_displayfield AS (
      SELECT * 
      FROM published_imagery_displayfield 
      WHERE source_field_id = 55994
    );
    CREATE TABLE tmp_published_imagery_overlaytype AS (
      SELECT * 
      FROM published_imagery_overlaytype 
      WHERE id IN (SELECT DISTINCT overlay_type_id FROM tmp_trees_data)
    );
    CREATE TABLE tmp_flights AS (
      SELECT * 
      FROM flights 
      WHERE id IN (SELECT flight_id FROM tmp_visits)
    );
  "

list=${tables[@]/#/-t tmp_}

echo "Dumping database data..."
pg_dump $url -O -a $list | sed 's/public.tmp_/public./' >> test/fixtures/dump.sql

list=(${tables[@]/%/;})
list=${list[@]/#/DROP TABLE IF EXISTS tmp_}

echo "Dropping temporal tables..."
psql $url -c "$list"