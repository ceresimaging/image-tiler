#!/bin/bash

url="postgres://$CORE_DB_USER:$CORE_DB_PASS@$CORE_DB_HOST:$CORE_DB_PORT/$CORE_DB_NAME"

tables=(
  customers_geo customers_farm customers_oldfarm customers_cropvarietal 
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
      WHERE overlay_id = '8bcf2e4b-a18b-4857-90c2-8ee80fd8df98'
        AND tree_id IN (SELECT id FROM tmp_trees)
    );
    CREATE TABLE tmp_customers_cropvarietal AS (
      SELECT * 
      FROM customers_cropvarietal
      WHERE id IN (SELECT DISTINCT varietal_id FROM tmp_trees)
    );
    CREATE TABLE tmp_published_imagery_overlay AS (
      SELECT * 
      FROM published_imagery_overlay
      WHERE id IN (SELECT DISTINCT overlay_id FROM tmp_trees_data)
    );
    CREATE TABLE tmp_published_imagery_overlaytype AS (
      SELECT * 
      FROM published_imagery_overlaytype 
      WHERE id IN (SELECT DISTINCT overlay_type_id FROM tmp_published_imagery_overlay)
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
    );
    CREATE TABLE tmp_markers AS (
      SELECT *
      FROM markers
      WHERE id IN ('84ddd2b1-6a02-468e-94b4-1751fce3c000')
    );
    CREATE TABLE tmp_visits AS (
      SELECT * 
      FROM visits
      WHERE id IN (
        SELECT 122950
        UNION
        SELECT DISTINCT visit_id FROM tmp_published_imagery_overlay
        UNION
        SELECT DISTINCT visit_id FROM tmp_markers
      )
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
pg_dump $url -O -a $list | sed 's/public.tmp_/public./' >> test/fixtures/dump.sql

list=(${tables[@]/%/;})
list=${list[@]/#/DROP TABLE IF EXISTS tmp_}

echo "Dropping temporal tables..."
psql $url -c "$list"