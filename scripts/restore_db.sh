#!/bin/bash

psql "postgres://tiler:tiler@postgres-tiler/postgres" -c "DROP DATABASE tiler;"
psql "postgres://tiler:tiler@postgres-tiler/postgres" -c "CREATE DATABASE tiler;"
psql "postgres://tiler:tiler@postgres-tiler/tiler" -c "CREATE EXTENSION postgis;"
psql "postgres://tiler:tiler@postgres-tiler/tiler" -f test/fixtures/dump.sql