#!/bin/bash

echo "Restoring DB structure and sample data from dump..."

psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/postgres" -c "DROP DATABASE $TEST_DB_NAME;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/postgres" -c "CREATE DATABASE $TEST_DB_NAME;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/$TEST_DB_NAME" -c "CREATE EXTENSION postgis;" > /dev/null 
psql "postgres://$TEST_DB_USER:$TEST_DB_PASS@$TEST_DB_HOST/$TEST_DB_NAME" -f test/fixtures/dump.sql > /dev/null 