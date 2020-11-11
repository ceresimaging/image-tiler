#!/bin/bash

echo "Restoring DB structure and sample data from dump..."

psql "postgres://tiler:tiler@postgres-tiler/postgres" -q -c "DROP DATABASE tiler;" > /dev/null 
psql "postgres://tiler:tiler@postgres-tiler/postgres" -q -c "CREATE DATABASE tiler;" > /dev/null 
psql "postgres://tiler:tiler@postgres-tiler/tiler" -q -c "CREATE EXTENSION postgis;" > /dev/null 
psql "postgres://tiler:tiler@postgres-tiler/tiler" -q -f test/fixtures/dump.sql > /dev/null 